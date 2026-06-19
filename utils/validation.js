/**
 * Validation Utilities for Order Form
 * Mèn Mén Coffee & Tea
 */

const ValidationUtils = {
  validateFullName(name) {
    if (!name || name.trim().length === 0) {
      return { valid: false, error: 'Vui lòng nhập họ và tên.' };
    }
    if (name.trim().length < 2) {
      return { valid: false, error: 'Họ và tên phải ít nhất 2 ký tự.' };
    }
    if (name.length > 50) {
      return { valid: false, error: 'Họ và tên không được vượt quá 50 ký tự.' };
    }
    return { valid: true };
  },

  validatePhoneNumber(phone) {
    if (!phone || phone.trim().length === 0) {
      return { valid: false, error: 'Vui lòng nhập số điện thoại.' };
    }

    const cleanPhone = phone.replace(/[\s\-]/g, '');
    const vnPhoneRegex = /^(03|05|07|08|09|01)\d{8,9}$/;

    if (!vnPhoneRegex.test(cleanPhone)) {
      return { valid: false, error: 'Số điện thoại chưa hợp lệ. Vui lòng nhập số điện thoại Việt Nam.' };
    }

    return { valid: true };
  },

  validateEmail(email) {
    if (!email || email.trim().length === 0) {
      return { valid: true };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Email chưa hợp lệ.' };
    }

    return { valid: true };
  },

  validateCity(city) {
    if (!city || city.trim().length === 0) {
      return { valid: false, error: 'Vui lòng chọn tỉnh/thành phố.' };
    }
    return { valid: true };
  },

  validateDistrict(district) {
    if (!district || district.trim().length === 0) {
      return { valid: false, error: 'Vui lòng chọn quận/huyện.' };
    }
    return { valid: true };
  },

  validateWard(ward) {
    if (!ward || ward.trim().length === 0) {
      return { valid: false, error: 'Vui lòng chọn phường/xã.' };
    }
    return { valid: true };
  },

  validateStreetAddress(address) {
    if (!address || address.trim().length === 0) {
      return { valid: false, error: 'Vui lòng nhập địa chỉ chi tiết.' };
    }
    if (address.trim().length < 5) {
      return { valid: false, error: 'Địa chỉ phải ít nhất 5 ký tự.' };
    }
    if (address.length > 150) {
      return { valid: false, error: 'Địa chỉ không được vượt quá 150 ký tự.' };
    }
    return { valid: true };
  },

  validateDeliveryNote(note) {
    if (!note || note.trim().length === 0) {
      return { valid: true };
    }
    if (note.length > 300) {
      return { valid: false, error: 'Ghi chú giao hàng không được vượt quá 300 ký tự.' };
    }
    return { valid: true };
  },

  validateContactNote(note) {
    if (!note || note.trim().length === 0) {
      return { valid: true };
    }
    if (note.length > 200) {
      return { valid: false, error: 'Ghi chú liên hệ không được vượt quá 200 ký tự.' };
    }
    return { valid: true };
  },

  validateBuildingArea(building) {
    if (!building || building.trim().length === 0) {
      return { valid: true };
    }
    if (building.length > 100) {
      return { valid: false, error: 'Khu dân cư/chung cư không được vượt quá 100 ký tự.' };
    }
    return { valid: true };
  },

  validateCustomerInfo(customerData) {
    const errors = {};

    const fullNameCheck = this.validateFullName(customerData.fullName);
    if (!fullNameCheck.valid) errors.fullName = fullNameCheck.error;

    const phoneCheck = this.validatePhoneNumber(customerData.phone);
    if (!phoneCheck.valid) errors.phone = phoneCheck.error;

    const emailCheck = this.validateEmail(customerData.email);
    if (!emailCheck.valid) errors.email = emailCheck.error;

    const contactNoteCheck = this.validateContactNote(customerData.contactNote);
    if (!contactNoteCheck.valid) errors.contactNote = contactNoteCheck.error;

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  },

  validateDeliveryAddress(addressData) {
    const errors = {};

    const cityCheck = this.validateCity(addressData.city);
    if (!cityCheck.valid) errors.city = cityCheck.error;

    const districtCheck = this.validateDistrict(addressData.district);
    if (!districtCheck.valid) errors.district = districtCheck.error;

    const wardCheck = this.validateWard(addressData.ward);
    if (!wardCheck.valid) errors.ward = wardCheck.error;

    const streetCheck = this.validateStreetAddress(addressData.streetAddress);
    if (!streetCheck.valid) errors.streetAddress = streetCheck.error;

    const buildingCheck = this.validateBuildingArea(addressData.buildingOrArea);
    if (!buildingCheck.valid) errors.buildingOrArea = buildingCheck.error;

    const noteCheck = this.validateDeliveryNote(addressData.deliveryNote);
    if (!noteCheck.valid) errors.deliveryNote = noteCheck.error;

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  },

  validateOrderForm(formData) {
    const customerValidation = this.validateCustomerInfo(formData.customer);
    const addressValidation = this.validateDeliveryAddress(formData.deliveryAddress);

    const allErrors = {
      ...customerValidation.errors,
      ...addressValidation.errors
    };

    return {
      valid: customerValidation.valid && addressValidation.valid,
      errors: allErrors
    };
  }
};