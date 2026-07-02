const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const Customer = require('../models/Customer');
const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const CementInventory = require('../models/CementInventory');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Create or Find a Customer
    let customer = await Customer.findOne({ mobile: '9876543210' });
    if (!customer) {
      customer = await Customer.create({
        fullName: 'John Doe',
        mobile: '9876543210',
        village: 'Example Village',
        city: 'Example City'
      });
    }

    // 2. Create or Find Inventory items
    let cement = await CementInventory.findOne({ brand: 'Ultratech', cementType: 'OPC' });
    if (!cement) {
      cement = await CementInventory.create({
        productType: 'cement',
        brand: 'Ultratech',
        cementType: 'OPC',
        grade: '53 Grade',
        bags: 500,
        currentStock: 500,
        purchasePrice: 350,
        sellingPrice: 380,
        status: 'in-stock',
        dateReceived: new Date()
      });
    }

    // 3. Create Sales for the past 30 days to populate charts
    const sales = [];
    const now = new Date();
    for (let i = 0; i < 30; i++) {
      const saleDate = new Date(now);
      saleDate.setDate(now.getDate() - i);
      
      const qty = Math.floor(Math.random() * 50) + 10;
      const total = qty * 380;
      
      sales.push({
        invoiceNumber: `INV-${Date.now()}-${i}`,
        customer: customer._id,
        items: [{
          productType: 'cement',
          productModel: 'CementInventory',
          product: cement._id,
          quantity: qty,
          unitPrice: 380,
          total: total
        }],
        subtotal: total,
        totalDiscount: 0,
        totalGst: 0,
        grandTotal: total,
        amountPaid: total,
        paymentMode: 'cash',
        paymentStatus: 'paid',
        saleDate: saleDate
      });
    }
    await Sale.insertMany(sales);

    // 4. Create Expenses
    const expenses = [];
    for (let i = 0; i < 30; i++) {
      const expDate = new Date(now);
      expDate.setDate(now.getDate() - i);
      expenses.push({
        category: 'Transportation',
        amount: Math.floor(Math.random() * 500) + 100,
        description: 'Transport charges',
        date: expDate
      });
    }
    await Expense.insertMany(expenses);

    console.log('Dummy data inserted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedData();
