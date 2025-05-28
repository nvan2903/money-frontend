// Chuẩn hóa format tiền tệ kiểu Việt Nam, ví dụ: 20.000 đ
export const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) return '';
  return amount.toLocaleString('vi-VN') + ' đ';
}

// También exportamos como default para mantener compatibilidad con importaciones existentes
export default formatCurrency;
