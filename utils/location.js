/**
 * Location Utilities for Address Management
 * Mèn Mén Coffee & Tea
 */

const LocationUtils = {
  locationsData: null,

  async initializeLocations() {
    try {
      const response = await fetch('./data/vietnam-locations.json');
      if (!response.ok) throw new Error('Failed to load locations');
      this.locationsData = await response.json();
      return true;
    } catch (error) {
      console.error('Error loading locations:', error);
      return false;
    }
  },

  getCities() {
    if (!this.locationsData) return [];
    return Object.keys(this.locationsData).sort();
  },

  getDistricts(city) {
    if (!this.locationsData || !city) return [];
    const cityData = this.locationsData[city];
    if (!cityData) return [];
    return Object.keys(cityData).sort();
  },

  getWards(city, district) {
    if (!this.locationsData || !city || !district) return [];
    const cityData = this.locationsData[city];
    if (!cityData) return [];
    const districtData = cityData[district];
    if (!districtData) return [];
    return districtData.sort();
  },

  buildFullAddress(addressData) {
    const parts = [];

    if (addressData.streetAddress) {
      parts.push(addressData.streetAddress);
    }

    if (addressData.buildingOrArea) {
      parts.push(addressData.buildingOrArea);
    }

    if (addressData.ward) {
      parts.push(addressData.ward);
    }

    if (addressData.district) {
      parts.push(addressData.district);
    }

    if (addressData.city) {
      parts.push(addressData.city);
    }

    return parts.join(', ');
  },

  checkDeliveryArea(city, district, ward) {
    const priorityAreas = [
      { city: 'Bình Dương', district: 'Thuận An', wards: ['Bình Hòa', 'An Phú', 'Lái Thiêu', 'KDC Việt Sing'] },
      { city: 'Bình Dương', district: 'Dĩ An', wards: ['Dĩ An', 'Tân Đông Hiệp', 'An Bình'] },
      { city: 'Bình Dương', district: 'Tân Uyên', wards: ['Tân Thành', 'Uyên Hưng'] },
      { city: 'Bình Dương', district: 'Bến Cát', wards: ['Tân Vạn', 'Tân Thạnh'] }
    ];

    const isPriority = priorityAreas.some(area => {
      return (
        area.city === city &&
        area.district === district &&
        area.wards.some(w => w.toLowerCase().includes(ward?.toLowerCase() || ''))
      );
    });

    if (isPriority) {
      return {
        status: 'fast_delivery',
        message: 'Quán hỗ trợ giao nhanh tại khu vực này.',
        estimatedShippingNote: 'Giao hàng trong vòng 30-45 phút.'
      };
    }

    const nearbyAreas = ['TP. Hồ Chí Minh', 'Đồng Nai', 'Long An'];
    if (nearbyAreas.includes(city)) {
      return {
        status: 'confirm_shipping_fee',
        message: 'Khu vực này có thể phát sinh phí ship. Quán sẽ liên hệ xác nhận trước khi giao.',
        estimatedShippingNote: 'Giao hàng từ 1-2 giờ.'
      };
    }

    return {
      status: 'unknown',
      message: 'Vui lòng liên hệ quán để xác nhận khả năng giao hàng.',
      estimatedShippingNote: 'Quán sẽ liên hệ xác nhận.'
    };
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  await LocationUtils.initializeLocations();
});