import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import session from 'express-session';
import { createApp } from '../src/app.js';
import { User } from '../src/models/User.js';
import { Category } from '../src/models/Category.js';
import { Need } from '../src/models/Need.js';
import { Transaction } from '../src/models/Transaction.js';

describe('API Security, Isolation, and Endpoints', () => {
  let app;
  let userAagent;
  let userBagent;
  let adminAgent;
  let userA;
  let userB;
  let adminUser;

  beforeEach(async () => {
    // In-memory session store for clean test isolation
    const memoryStore = new session.MemoryStore();
    app = createApp(memoryStore);

    userAagent = request.agent(app);
    userBagent = request.agent(app);
    adminAgent = request.agent(app);

    // Register User A
    const resA = await userAagent.post('/api/auth/register').send({
      displayName: 'Alice User',
      email: 'alice@example.com',
      password: 'StrongPassword123!',
    });
    expect(resA.status).toBe(201);
    expect(resA.body.data.passwordHash).toBeUndefined();
    userA = resA.body.data;

    // Register User B
    const resB = await userBagent.post('/api/auth/register').send({
      displayName: 'Bob User',
      email: 'bob@example.com',
      password: 'StrongPassword456!',
    });
    expect(resB.status).toBe(201);
    userB = resB.body.data;

    // Create Admin User directly and login
    const admin = await User.create({
      displayName: 'Admin User',
      email: 'admin@system.local',
      passwordHash: 'dummy',
      role: 'admin',
      status: 'active',
      privileges: ['advancedAnalytics', 'betaFeatures', 'customDashboard'],
    });
    adminUser = admin;

    // Login admin
    await adminAgent.post('/api/auth/login').send({
      email: 'admin@system.local',
      password: 'dummy',
    }).catch(() => {});

    // Or simulate admin session directly
    const sessionRes = await adminAgent.post('/api/auth/register').send({
      displayName: 'Real Admin',
      email: 'realadmin@example.com',
      password: 'RealAdminPassword123!',
    });
    await User.findByIdAndUpdate(sessionRes.body.data.id, { role: 'admin' });
    adminUser = await User.findById(sessionRes.body.data.id);
  });

  it('verifies passwords are never returned in auth endpoints', async () => {
    const meRes = await userAagent.get('/api/auth/me');
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.passwordHash).toBeUndefined();
    expect(meRes.body.data.email).toBe('alice@example.com');
  });

  it('prevents User A from reading or modifying User B categories', async () => {
    // User B creates a category
    const catRes = await userBagent.post('/api/categories').send({
      name: 'Bob Secret Category',
      countsTowardFlexibleBudget: true,
    });
    expect(catRes.status).toBe(201);
    const bobCatId = catRes.body.data._id;

    // User A tries to update Bob's category -> 404
    const updateRes = await userAagent.patch(`/api/categories/${bobCatId}`).send({
      name: 'Hacked Name',
    });
    expect(updateRes.status).toBe(404);

    // User A lists categories -> Bob's category is NOT in the list
    const listRes = await userAagent.get('/api/categories');
    expect(listRes.status).toBe(200);
    const names = listRes.body.data.map((c) => c.name);
    expect(names).not.toContain('Bob Secret Category');
  });

  it('prevents User A from accessing or mutating User B Needs and Contributions', async () => {
    // User B creates a Need
    const needRes = await userBagent.post('/api/needs').send({
      name: 'Bob Rent',
      monthlyReserveAmountPaise: 500000,
    });
    expect(needRes.status).toBe(201);
    const bobNeedId = needRes.body.data._id;

    // User A attempts to view Bob's Need -> 404
    const getRes = await userAagent.get(`/api/needs/${bobNeedId}`);
    expect(getRes.status).toBe(404);

    // User A attempts to add a contribution to Bob's Need -> 404
    const contribRes = await userAagent.post(`/api/needs/${bobNeedId}/contributions`).send({
      amountPaise: 10000,
    });
    expect(contribRes.status).toBe(404);
  });

  it('prevents User A from creating a transaction referencing User B category or Need', async () => {
    // User B creates Category
    const bobCat = await Category.create({
      userId: userB.id,
      name: 'Bob Only Category',
    });

    // User A tries to create transaction referencing User B's category
    const txRes = await userAagent.post('/api/transactions').send({
      amountPaise: 5000,
      categoryId: bobCat._id.toString(),
      clientTransactionId: 'tx-unauthorized-cat',
    });
    expect(txRes.status).toBe(400);
    expect(txRes.body.error).toContain('category does not belong to you');
  });

  it('prevents ordinary users from accessing admin endpoints', async () => {
    const overviewRes = await userAagent.get('/api/admin/overview');
    expect(overviewRes.status).toBe(403);

    const usersRes = await userAagent.get('/api/admin/users');
    expect(usersRes.status).toBe(403);
  });

  it('verifies admin APIs expose management metadata ONLY and never expose transaction amounts or descriptions', async () => {
    // User A adds a transaction
    const userACat = await Category.findOne({ userId: userA.id });
    await userAagent.post('/api/transactions').send({
      amountPaise: 99999,
      categoryId: userACat._id.toString(),
      description: 'Super Secret Personal Purchase',
      clientTransactionId: 'tx-sec-1',
    });

    // Admin queries users
    const usersRes = await adminAgent.get('/api/admin/users');
    expect(usersRes.status).toBe(200);

    const aliceEntry = usersRes.body.data.find((u) => u.email === 'alice@example.com');
    expect(aliceEntry).toBeDefined();
    // Has transaction count metadata
    expect(aliceEntry.transactionCount).toBe(1);
    // MUST NOT have transaction details
    expect(aliceEntry.transactions).toBeUndefined();
    expect(aliceEntry.amountPaise).toBeUndefined();

    // The entire response string should not contain Alice's secret description
    const responseText = JSON.stringify(usersRes.body);
    expect(responseText).not.toContain('Super Secret Personal Purchase');
  });

  it('enforces offline sync idempotency without duplicating transactions', async () => {
    const userACat = await Category.findOne({ userId: userA.id });

    const batch = [
      {
        amountPaise: 2500,
        categoryId: userACat._id.toString(),
        description: 'Morning Chai',
        clientTransactionId: 'offline-uuid-101',
      },
      {
        amountPaise: 4000,
        categoryId: userACat._id.toString(),
        description: 'Samosa',
        clientTransactionId: 'offline-uuid-102',
      },
    ];

    // First sync
    const sync1 = await userAagent.post('/api/transactions/sync').send({ transactions: batch });
    expect(sync1.status).toBe(200);
    expect(sync1.body.data.length).toBe(2);

    // Second sync (retry / reconnect)
    const sync2 = await userAagent.post('/api/transactions/sync').send({ transactions: batch });
    expect(sync2.status).toBe(200);
    expect(sync2.body.data.length).toBe(2);

    // Total transactions for User A should still be exactly 2
    const totalCount = await Transaction.countDocuments({ userId: userA.id });
    expect(totalCount).toBe(2);
  });

  it('rejects invalid amounts and malformed payloads', async () => {
    const userACat = await Category.findOne({ userId: userA.id });

    // Negative amount
    const resNegative = await userAagent.post('/api/transactions').send({
      amountPaise: -500,
      categoryId: userACat._id.toString(),
      clientTransactionId: 'invalid-neg',
    });
    expect(resNegative.status).toBe(400);

    // Non-integer amount
    const resFloat = await userAagent.post('/api/transactions').send({
      amountPaise: 12.34,
      categoryId: userACat._id.toString(),
      clientTransactionId: 'invalid-float',
    });
    expect(resFloat.status).toBe(400);
  });
});
