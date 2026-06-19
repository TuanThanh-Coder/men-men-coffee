/**
 * Geolocation Utilities for GPS Detection
 * Mèn Mén Coffee & Tea
 */

const GeolocationUtils = {
  options: {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000
  },

  isSupported() {
    return 'geolocation' in navigator;
  },

  getCurrentLocation(onSuccess, onError) {
    if (!this.isSupported()) {
      onError({
        code: 'NOT_SUPPORTED',
        message: 'Trình duyệt của bạn không hỗ trợ định vị.'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy),
          timestamp: new Date().toISOString(),
          source: 'browser_geolocation'
        };
        onSuccess(location);
      },
      (error) => {
        let errorMessage = '';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Bạn chưa cho phép truy cập vị trị. Vui lòng nhập địa chỉ thủ công.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Thiết bị chưa xác định được vị trí. Vui lòng thử lại hoặc nhập địa chỉ thủ công.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Quá thời gian xác định vị trí. Vui lòng thử lại.';
            break;
          default:
            errorMessage = 'Lỗi khi lấy vị trí. Vui lòng thử lại.';
        }
        onError({
          code: error.code,
          message: errorMessage
        });
      },
      this.options
    );
  }
};