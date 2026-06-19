/**
 * Order Utilities for Order Management
 * Mèn Mén Coffee & Tea
 */

const OrderUtils = {
  generateOrderId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `MM${timestamp.toString().slice(-8)}${random}`;
  },

  buildOrderData(customerData, addressData, locationData, deliveryCheck, cartData, paymentData) {
    const fullAddress = LocationUtils.buildFullAddress(addressData);

    const orderData = {
      brand: 'Mèn Mén Coffee & Tea',
      orderId: this.generateOrderId(),
      createdAt: new Date().toISOString(),

      customer: {
        fullName: customerData.fullName.trim(),
        phone: customerData.phone.trim().replace(/[\s\-]/g, ''),
        email: customerData.email ? customerData.email.trim() : '',
        contactNote: customerData.contactNote ? customerData.contactNote.trim() : ''
      },

      deliveryAddress: {
        city: addressData.city,
        district: addressData.district,
        ward: addressData.ward,
        streetAddress: addressData.streetAddress.trim(),
        buildingOrArea: addressData.buildingOrArea ? addressData.buildingOrArea.trim() : '',
        deliveryNote: addressData.deliveryNote ? addressData.deliveryNote.trim() : '',
        fullAddress: fullAddress
      },

      customerLocation: {
        latitude: locationData.latitude || null,
        longitude: locationData.longitude || null,
        accuracy: locationData.accuracy || null,
        source: locationData.source || 'manual'
      },

      deliveryCheck: {
        status: deliveryCheck.status,
        message: deliveryCheck.message,
        estimatedShippingNote: deliveryCheck.estimatedShippingNote
      },

      cart: cartData.items || [],

      payment: {
        subtotal: paymentData.subtotal || 0,
        shippingFee: paymentData.shippingFee || null,
        discount: paymentData.discount || 0,
        total: paymentData.total || 0,
        method: paymentData.method || 'COD'
      },

      shop: {
        name: 'Mèn Mén Coffee & Tea',
        hotline: '0396610088',
        address: 'ĐƯỜNG DA8/NA1 - KDC VIỆT SING BÌNH DƯƠNG'
      }
    };

    return orderData;
  },

  async submitOrder(orderData) {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        console.warn('API not available, saving to localStorage');
        this.saveOrderToLocalStorage(orderData);
        return {
          success: true,
          data: { message: 'Order saved locally' }
        };
      }

      const result = await response.json();
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Error submitting order:', error);
      this.saveOrderToLocalStorage(orderData);
      return {
        success: true,
        data: { message: 'Order saved locally' }
      };
    }
  },

  saveOrderToLocalStorage(orderData) {
    try {
      const orders = JSON.parse(localStorage.getItem('menmen_orders') || '[]');
      orders.push(orderData);
      localStorage.setItem('menmen_orders', JSON.stringify(orders));
      return true;
    } catch (error) {
      console.error('Error saving order to localStorage:', error);
      return false;
    }
  }
};