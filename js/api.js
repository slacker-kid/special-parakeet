// API Service for Pro-Fitness
// Replace this URL with your deployed Web App URL
const API_URL = 'https://script.google.com/macros/s/AKfycbzKFhf7VHDHauS5C9tY0Um0jDkUm1bPZN6dcxpYLO1mRo-rv3YCIn2eBmaRH1HcZLhOOg/exec';

const api = {
    async request(action, data = {}) {
        if (API_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
            console.error('API URL not configured');
            alert('Please configure the API URL in js/api.js');
            return { result: 'error', message: 'API URL not configured' };
        }

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                mode: 'no-cors', // 'no-cors' is often needed for GAS Web Apps unless configured perfectly
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action, ...data })
            });

            // Note: with 'no-cors', we can't read the response body directly in standard browser fetch.
            // However, GAS usually requires a redirect or specific setup for CORS.
            // If we use 'no-cors', we assume success if no network error, but we can't get data back easily.
            // To get data back, we need CORS enabled on the script (ContentService) which the provided script does.
            // So we should try 'cors' mode first.

            // Let's retry with standard fetch assuming the script handles CORS (which ContentService usually does if setMimeType is JSON)
        } catch (e) {
            console.error('API Request Failed', e);
            return { result: 'error', message: 'Network error' };
        }
    },

    // Improved request method for GAS that handles the text response
    async post(action, data = {}) {
        if (API_URL.includes('YOUR_GOOGLE_APPS_SCRIPT')) {
            alert('Please configure the API URL in js/api.js');
            return { result: 'error', message: 'API Config Missing' };
        }

        const body = JSON.stringify({ action, ...data });

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: body
                // Google Apps Script Web Apps automatically handle CORS if the response is JSON
            });
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return { result: 'error', message: error.message };
        }
    },

    async login(email, password) {
        return this.post('login', { email, password });
    },

    async register(name, email, password) {
        return this.post('register', { name, email, password });
    },

    async searchMember(query) {
        return this.post('searchMember', { query });
    },

    async addMember(memberData) {
        return this.post('addMember', memberData);
    },

    async incrementAttendance(id) {
        return this.post('incrementAttendance', { id });
    },

    async getMemberAttendance(email) {
        return this.post('getMemberAttendance', { email });
    },

    async updateAttendance(email, date, status) {
        return this.post('updateAttendance', { email, date, status });
    },

    async getUsers() {
        return this.post('getUsers');
    },

    async createCoupon(couponData) {
        return this.post('createCoupon', couponData);
    },

    async getCoupons() {
        return this.post('getCoupons');
    },

    async deleteCoupon(rowIndex) {
        return this.post('deleteCoupon', { rowIndex });
    }
};
