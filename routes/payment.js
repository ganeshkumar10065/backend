const express = require('express');
const router = express.Router();
const axios = require('axios');
const md5 = require('md5');
const { storePassword, getPassword } = require('../utils/passwordManager');
const { sendTelegramMessage } = require('../utils/telegramBot');

// Store passwords temporarily (in production, use a proper database)
const passwordStore = new Map();

router.post('/process', async (req, res) => {
    try {
        const paymentData = {
            mch_id: '85071336',
            mch_order_no: `ORDER${Date.now()}`,
            notifyUrl: 'https://xyu10.top/api/payGate/notify',
            page_url: 'https://xyu10.top/api/payGate/return',
            trade_amount: '100',
            currency: 'INR',
            pay_type: 'INDIA_UPI',
            payer_phone: '9876543210',
            attach: 'Password Access',
            sign_type: 'MD5'
        };

        // Generate signature
        const privateKey = 'f7b3eb7e62f0c439763048c403ee158a';
        const signData = { ...paymentData };
        delete signData.sign;
        delete signData.sign_type;

        const sortedKeys = Object.keys(signData).sort();
        const concatenatedString = sortedKeys
            .filter(key => signData[key] !== null && signData[key] !== undefined && signData[key] !== '')
            .map(key => `${key}=${signData[key]}`)
            .join('&');

        const stringToSign = `${concatenatedString}&key=${privateKey}`;
        const sign = md5(stringToSign).toLowerCase();
        paymentData.sign = sign;

        // Send request to payment gateway
        const response = await axios.post('https://xyu10.top/api/payGate/payCollect', 
            paymentData,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                }
            }
        );

        // Send the response back to frontend
        res.json(response.data);

    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({
            code: 1,
            msg: 'Payment failed',
            error: error.message
        });
    }
});

// Store password with order ID
router.post('/store', (req, res) => {
    try {
        const { orderId, password, username } = req.body;
        storePassword(orderId, password, username);
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// Verify payment and return password
router.get('/verify/:orderId', (req, res) => {
    try {
        const { orderId } = req.params;
        const passwordData = getPassword(orderId);
        res.json({
            success: true,
            password: passwordData.password
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
});

// Payment notification handler
router.post('/notify', async (req, res) => {
    try {
        const {
            mch_id,
            mch_order_no,
            status,
            trade_amount,
            sucOrderAmount,
            orderDate,
            attach,
            sign_type,
            sign
        } = req.body;

        // Log the incoming notification to console first
        console.log('🔔 Payment Notification Received:', {
            orderId: mch_order_no,
            status,
            amount: `${trade_amount} ₹`,
            actualAmount: `${sucOrderAmount} ₹`,
            date: orderDate,
            attach,
            receivedSign: sign
        });

        // Validate required fields
        if (!mch_id || !mch_order_no || !status || !trade_amount || !sucOrderAmount || !orderDate || !sign) {
            const errorMessage = `❌ Invalid Payment Notification:\nMissing required parameters for order: ${mch_order_no}`;
            await sendTelegramMessage(errorMessage);
            console.error(errorMessage);
            return res.status(400).json({
                code: -1,
                msg: 'Missing required parameters',
                data: null
            });
        }

        // Validate merchant ID
        const MERCHANT_ID = '85071336';
        if (mch_id !== MERCHANT_ID) {
            const errorMessage = `❌ Invalid Merchant ID:\nOrder: ${mch_order_no}\nReceived ID: ${mch_id}\nExpected ID: ${MERCHANT_ID}`;
            await sendTelegramMessage(errorMessage);
            console.error(errorMessage);
            return res.status(400).json({
                code: -1,
                msg: 'Invalid merchant ID',
                data: null
            });
        }

        // Validate signature
        const privateKey = 'f7b3eb7e62f0c439763048c403ee158a';
        
        // Create signature data object with only the required fields
        const signData = {
            mch_id,
            mch_order_no,
            status,
            trade_amount,
            sucOrderAmount,
            orderDate
        };

        // Add attach only if it exists
        if (attach) {
            signData.attach = attach;
        }

        // Sort keys and create signature string
        const sortedKeys = Object.keys(signData).sort();
        const concatenatedString = sortedKeys
            .map(key => `${key}=${signData[key]}`)
            .join('&');

        const stringToSign = `${concatenatedString}&key=${privateKey}`;
        console.log('String to sign:', stringToSign);

        const calculatedSign = md5(stringToSign).toLowerCase();
        console.log('Calculated sign:', calculatedSign);

        if (calculatedSign !== sign) {
            const errorMessage = `❌ Invalid Signature:\nOrder: ${mch_order_no}\nReceived Sign: ${sign}\nCalculated Sign: ${calculatedSign}`;
            await sendTelegramMessage(errorMessage);
            console.error(errorMessage);
            return res.status(400).json({
                code: -1,
                msg: 'Invalid signature',
                data: null
            });
        }

        // Process successful payment
        if (status === '1') {
            const successMessage = `✅ Payment Successful:\nOrder ID: ${mch_order_no}\nAmount: ${trade_amount} ₹\nActual Amount: ${sucOrderAmount} ₹\nDate: ${orderDate}\nAttach: ${attach}`;
            
            await sendTelegramMessage(successMessage);
            console.log('✅ Payment Successful:', {
                orderId: mch_order_no,
                amount: `${trade_amount} ₹`,
                actualAmount: `${sucOrderAmount} ₹`,
                date: orderDate,
                attach
            });

            // Return success to stop further notifications
            return res.send('success');
        }

        // If payment is not successful
        const errorMessage = `❌ Payment Not Successful:\nOrder ID: ${mch_order_no}\nStatus: ${status}`;
        await sendTelegramMessage(errorMessage);
        console.error(errorMessage);

        return res.status(400).json({
            code: -1,
            msg: 'Payment not successful',
            data: null
        });

    } catch (error) {
        const errorMessage = `❌ Payment Notification Error:\nError: ${error.message}`;
        await sendTelegramMessage(errorMessage);
        console.error('Payment notification error:', error);
        return res.status(500).json({
            code: -1,
            msg: 'Internal server error',
            data: null
        });
    }
});

module.exports = router; 