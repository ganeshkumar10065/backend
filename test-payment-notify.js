const axios = require('axios');
const md5 = require('md5');

async function testPaymentNotify() {
    try {
        // Test data
        const testData = {
            mch_id: '85071336',
            mch_order_no: 'ORDER1617454732',
            status: '1',
            trade_amount: '100',
            sucOrderAmount: '100',
            orderDate: '2021-03-23 01:11:52',
            attach: 'test_payment',
            sign_type: 'MD5'
        };

        // Calculate signature
        const privateKey = 'f7b3eb7e62f0c439763048c403ee158a';
        const signData = { ...testData };
        delete signData.sign_type;

        const sortedKeys = Object.keys(signData).sort();
        const concatenatedString = sortedKeys
            .map(key => `${key}=${signData[key]}`)
            .join('&');

        const stringToSign = `${concatenatedString}&key=${privateKey}`;
        console.log('String to sign:', stringToSign);

        const sign = md5(stringToSign).toLowerCase();
        console.log('Calculated sign:', sign);

        // Add signature to test data
        testData.sign = sign;

        // Convert to URL encoded string
        const formData = Object.entries(testData)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');

        console.log('Sending request with data:', formData);

        const response = await axios.post('http://localhost:3001/api/payment/notify', 
            formData,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testPaymentNotify(); 