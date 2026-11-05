import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        user: resolve(__dirname, 'user.html'),
        transport: resolve(__dirname, 'transport.html'),
        passenger: resolve(__dirname, 'passenger.html'),
        payment: resolve(__dirname, 'payment.html'),
        ride: resolve(__dirname, 'ride.html'),
        mybookings: resolve(__dirname, 'mybookings.html'),
        adminLogin: resolve(__dirname, 'admin-login.html'),
        adminSignup: resolve(__dirname, 'admin-signup.html'),
        admin: resolve(__dirname, 'admin.html'),
      },
    },
  },
});