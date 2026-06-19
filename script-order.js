/**
 * Order Form Script - Mèn Mén Coffee & Tea
 * Quản lý form đặt hàng, validation, và gửi đơn
 */

class OrderForm {
  constructor() {
    this.formElement = document.getElementById('orderForm');
    this.locationData = {};
    this.deliveryCheckData = {};
    this.isSubmitting = false;

    this.initializeEventListeners();
    this.loadDefaultDeliveryCheck();
  }

  initializeEventListeners() {
    const citySelect = document.getElementById('deliveryCity');
    const districtSelect = document.getElementById('deliveryDistrict');
    const wardSelect = document.getElementById('deliveryWard');

    if (citySelect) {
      citySelect.addEventListener('change', () => this.onCityChange());
      this.loadCities();
    }

    if (districtSelect) {
      districtSelect.addEventListener('change', () => this.onDistrictChange());
    }

    const geoButton = document.getElementById('useGeolocationBtn');
    if (geoButton) {
      geoButton.addEventListener('click', () => this.handleGeolocation());
    }

    if (this.formElement) {
      this.formElement.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    this.attachFieldValidation();
  }

  attachFieldValidation() {
    const fields = this.formElement.querySelectorAll('input, select, textarea');
    fields.forEach(field => {
      field.addEventListener('blur', () => this.validateField(field));
      field.addEventListener('input', () => this.validateField(field));
    });
  }

  loadCities() {
    const citySelect = document.getElementById('deliveryCity');
    if (!citySelect || !LocationUtils.locationsData) return;

    const cities = LocationUtils.getCities();
    citySelect.innerHTML = '<option value="">-- Chọn tỉnh/thành phố --</option>';

    cities.forEach(city => {
      const option = document.createElement('option');
      option.value = city;
      option.textContent = city;
      citySelect.appendChild(option);
    });
  }

  onCityChange() {
    const citySelect = document.getElementById('deliveryCity');
    const city = citySelect.value;

    this.resetDistricts();
    this.resetWards();

    if (!city) return;

    this.loadDistricts(city);
  }

  loadDistricts(city) {
    const districtSelect = document.getElementById('deliveryDistrict');
    if (!districtSelect) return;

    const districts = LocationUtils.getDistricts(city);
    districtSelect.innerHTML = '<option value="">-- Chọn quận/huyện --</option>';

    districts.forEach(district => {
      const option = document.createElement('option');
      option.value = district;
      option.textContent = district;
      districtSelect.appendChild(option);
    });

    districtSelect.disabled = false;
  }

  onDistrictChange() {
    const citySelect = document.getElementById('deliveryCity');
    const districtSelect = document.getElementById('deliveryDistrict');

    const city = citySelect.value;
    const district = districtSelect.value;

    this.resetWards();

    if (!city || !district) return;

    this.loadWards(city, district);
    this.checkDeliveryArea(city, district);
  }

  loadWards(city, district) {
    const wardSelect = document.getElementById('deliveryWard');
    if (!wardSelect) return;

    const wards = LocationUtils.getWards(city, district);
    wardSelect.innerHTML = '<option value="">-- Chọn phường/xã --</option>';

    wards.forEach(ward => {
      const option = document.createElement('option');
      option.value = ward;
      option.textContent = ward;
      wardSelect.appendChild(option);
    });

    wardSelect.disabled = false;
  }

  resetDistricts() {
    const districtSelect = document.getElementById('deliveryDistrict');
    if (districtSelect) {
      districtSelect.innerHTML = '<option value="">-- Chọn quận/huyện --</option>';
      districtSelect.disabled = true;
    }
  }

  resetWards() {
    const wardSelect = document.getElementById('deliveryWard');
    if (wardSelect) {
      wardSelect.innerHTML = '<option value="">-- Chọn phường/xã --</option>';
      wardSelect.disabled = true;
    }
    this.hideDeliveryAreaNotice();
  }

  handleGeolocation() {
    const geoButton = document.getElementById('useGeolocationBtn');
    const locationStatus = document.getElementById('locationStatus');

    if (!geoButton) return;

    geoButton.disabled = true;
    geoButton.classList.add('loading');
    geoButton.textContent = 'Đang xác định vị trí...';

    if (locationStatus) {
      locationStatus.className = 'location-status loading';
      locationStatus.textContent = 'Đang xác định vị trí của bạn...';
    }

    GeolocationUtils.getCurrentLocation(
      (location) => this.onGeolocationSuccess(location),
      (error) => this.onGeolocationError(error, geoButton)
    );
  }

  onGeolocationSuccess(location) {
    const geoButton = document.getElementById('useGeolocationBtn');
    const locationStatus = document.getElementById('locationStatus');

    this.locationData = {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
      source: 'browser_geolocation'
    };

    geoButton.disabled = false;
    geoButton.classList.remove('loading');
    geoButton.textContent = '📍 Dùng vị trí hiện tại';

    if (locationStatus) {
      locationStatus.className = 'location-status success';
      locationStatus.innerHTML = `Đã lấy vị trí thành công (Độ chính xác: ±${location.accuracy}m)`;
    }

    console.log('Geolocation success:', location);
  }

  onGeolocationError(error, geoButton) {
    const locationStatus = document.getElementById('locationStatus');

    geoButton.disabled = false;
    geoButton.classList.remove('loading');
    geoButton.textContent = '📍 Dùng vị trí hiện tại';

    if (locationStatus) {
      locationStatus.className = 'location-status error';
      locationStatus.textContent = error.message;
    }

    console.error('Geolocation error:', error);
  }

  checkDeliveryArea(city, district, ward = '') {
    const wardSelect = document.getElementById('deliveryWard');
    const selectedWard = ward || (wardSelect ? wardSelect.value : '');

    const deliveryCheck = LocationUtils.checkDeliveryArea(city, district, selectedWard);
    this.deliveryCheckData = deliveryCheck;

    this.showDeliveryAreaNotice(deliveryCheck);
  }

  showDeliveryAreaNotice(deliveryCheck) {
    const notice = document.getElementById('deliveryAreaNotice');
    if (!notice) return;

    notice.className = `delivery-area-notice show ${deliveryCheck.status}`;
    notice.innerHTML = `
      <div class="notice-title">${this.getDeliveryStatusIcon(deliveryCheck.status)} ${this.getDeliveryStatusTitle(deliveryCheck.status)}</div>
      <div class="notice-text">${deliveryCheck.message}</div>
      <div class="notice-text" style="margin-top: 8px; font-size: 13px; opacity: 0.8;">${deliveryCheck.estimatedShippingNote}</div>
    `;
  }

  hideDeliveryAreaNotice() {
    const notice = document.getElementById('deliveryAreaNotice');
    if (notice) {
      notice.className = 'delivery-area-notice';
    }
  }

  getDeliveryStatusIcon(status) {
    const icons = {
      'fast_delivery': '✓',
      'confirm_shipping_fee': '⚠',
      'unknown': 'ℹ'
    };
    return icons[status] || 'ℹ';
  }

  getDeliveryStatusTitle(status) {
    const titles = {
      'fast_delivery': 'Giao nhanh',
      'confirm_shipping_fee': 'Xác nhận phí ship',
      'unknown': 'Liên hệ quán'
    };
    return titles[status] || 'Thông tin giao hàng';
  }

  validateField(field) {
    const fieldName = field.name;
    let validation = { valid: true };

    if (fieldName === 'fullName') {
      validation = ValidationUtils.validateFullName(field.value);
    } else if (fieldName === 'phone') {
      validation = ValidationUtils.validatePhoneNumber(field.value);
    } else if (fieldName === 'email') {
      validation = ValidationUtils.validateEmail(field.value);
    } else if (fieldName === 'deliveryCity') {
      validation = ValidationUtils.validateCity(field.value);
    } else if (fieldName === 'deliveryDistrict') {
      validation = ValidationUtils.validateDistrict(field.value);
    } else if (fieldName === 'deliveryWard') {
      validation = ValidationUtils.validateWard(field.value);
    } else if (fieldName === 'streetAddress') {
      validation = ValidationUtils.validateStreetAddress(field.value);
    } else if (fieldName === 'buildingOrArea') {
      validation = ValidationUtils.validateBuildingArea(field.value);
    } else if (fieldName === 'deliveryNote') {
      validation = ValidationUtils.validateDeliveryNote(field.value);
    } else if (fieldName === 'contactNote') {
      validation = ValidationUtils.validateContactNote(field.value);
    }

    this.setFieldState(field, validation);
  }

  setFieldState(field, validation) {
    const fieldContainer = field.closest('.form-field');
    if (!fieldContainer) return;

    if (validation.valid) {
      fieldContainer.classList.remove('error');
      fieldContainer.classList.add('success');
      const errorMsg = fieldContainer.querySelector('.error-message');
      if (errorMsg) errorMsg.textContent = '';
    } else {
      fieldContainer.classList.remove('success');
      fieldContainer.classList.add('error');
      const errorMsg = fieldContainer.querySelector('.error-message');
      if (errorMsg) errorMsg.textContent = validation.error;
    }
  }

  async handleFormSubmit(e) {
    e.preventDefault();

    if (this.isSubmitting) return;

    const formData = this.getFormData();
    const validation = ValidationUtils.validateOrderForm(formData);

    if (!validation.valid) {
      this.displayValidationErrors(validation.errors);
      return;
    }

    this.isSubmitting = true;
    const submitBtn = this.formElement.querySelector('.submit-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add('loading');
      submitBtn.textContent = 'Đang gửi đơn hàng...';
    }

    try {
      const cartData = this.getCartData();
      const paymentData = this.getPaymentData();

      const orderData = OrderUtils.buildOrderData(
        formData.customer,
        formData.deliveryAddress,
        this.locationData,
        this.deliveryCheckData,
        cartData,
        paymentData
      );

      console.log('Order data:', orderData);

      const result = await OrderUtils.submitOrder(orderData);

      if (result.success) {
        this.showSuccessModal(orderData);
        this.formElement.reset();
        this.resetFormStates();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Order submission error:', error);
      alert(`Chưa gửi được đơn hàng. Vui lòng thử lại hoặc gọi hotline 0396610088.\n\nLỗi: ${error.message}`);
    } finally {
      this.isSubmitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        submitBtn.textContent = 'Đặt hàng';
      }
    }
  }

  getFormData() {
    return {
      customer: {
        fullName: document.getElementById('fullName')?.value || '',
        phone: document.getElementById('phone')?.value || '',
        email: document.getElementById('email')?.value || '',
        contactNote: document.getElementById('contactNote')?.value || ''
      },
      deliveryAddress: {
        city: document.getElementById('deliveryCity')?.value || '',
        district: document.getElementById('deliveryDistrict')?.value || '',
        ward: document.getElementById('deliveryWard')?.value || '',
        streetAddress: document.getElementById('streetAddress')?.value || '',
        buildingOrArea: document.getElementById('buildingOrArea')?.value || '',
        deliveryNote: document.getElementById('deliveryNote')?.value || ''
      }
    };
  }

  getCartData() {
    try {
      const cart = JSON.parse(localStorage.getItem('menmen_cart') || '[]');
      return { items: cart };
    } catch {
      return { items: [] };
    }
  }

  getPaymentData() {
    const cart = JSON.parse(localStorage.getItem('menmen_cart') || '[]');
    const subtotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

    return {
      subtotal: subtotal,
      shippingFee: 30000,
      discount: 0,
      total: subtotal + 30000,
      method: 'COD'
    };
  }

  displayValidationErrors(errors) {
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      const field = this.formElement.querySelector(`[name="${firstErrorField}"]`);
      if (field) {
        field.focus();
        field.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    Object.keys(errors).forEach(fieldName => {
      const field = this.formElement.querySelector(`[name="${fieldName}"]`);
      if (field) {
        this.validateField(field);
      }
    });
  }

  resetFormStates() {
    const fields = this.formElement.querySelectorAll('.form-field');
    fields.forEach(field => {
      field.classList.remove('error', 'success');
      const errorMsg = field.querySelector('.error-message');
      if (errorMsg) errorMsg.textContent = '';
    });
  }

  showSuccessModal(orderData) {
    const modal = document.getElementById('orderSuccessModal');
    if (!modal) return;

    document.getElementById('successOrderId').textContent = orderData.orderId;
    document.getElementById('successCustomerName').textContent = orderData.customer.fullName;
    document.getElementById('successPhone').textContent = orderData.customer.phone;
    document.getElementById('successAddress').textContent = orderData.deliveryAddress.fullAddress;
    document.getElementById('successTotal').textContent = orderData.payment.total.toLocaleString('vi-VN') + '₫';

    modal.classList.add('show');

    const callBtn = modal.querySelector('.call-btn');
    if (callBtn) {
      callBtn.onclick = () => window.location.href = 'tel:0396610088';
    }

    const orderMoreBtn = modal.querySelector('.order-more-btn');
    if (orderMoreBtn) {
      orderMoreBtn.onclick = () => {
        modal.classList.remove('show');
        window.location.href = 'menu.html';
      };
    }

    const homeBtn = modal.querySelector('.home-btn');
    if (homeBtn) {
      homeBtn.onclick = () => {
        modal.classList.remove('show');
        window.location.href = 'index.html';
      };
    }
  }

  loadDefaultDeliveryCheck() {
    this.deliveryCheckData = {
      status: 'unknown',
      message: 'Chọn địa chỉ để kiểm tra khả năng giao hàng.',
      estimatedShippingNote: ''
    };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new OrderForm();
});