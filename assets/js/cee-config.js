/**
 * Cấu hình dùng chung cho cả 3 trang. Nạp TRƯỚC mọi script khác.
 *
 * NEED CONFIRMATION: đề bài KHÔNG quy định danh mục, đơn vị khoảng cách hay vị trí
 * tham chiếu. Các giá trị dưới đây là DỮ LIỆU MẪU để bản demo chạy được, không phải
 * yêu cầu bắt buộc của đề. Nhóm chỉ cần sửa tại file này khi chốt chính thức.
 */
window.CEEConfig = Object.freeze({
  // Danh mục mẫu (chờ nhóm xác nhận). Trang Danh mục vẫn lấy danh sách lọc từ dữ liệu thực tế.
  categories: Object.freeze([
    "Đồ điện tử",
    "Đồ gia dụng",
    "Nội thất",
    "Quần áo & phụ kiện",
    "Sách & văn phòng phẩm",
    "Khác",
  ]),

  // Đơn vị khoảng cách mẫu (chờ nhóm xác nhận).
  distanceUnit: "km",

  // Khoảng cách do người đăng tự nhập tay, KHÔNG có định vị GPS hay đo thực tế.
  distanceReference: "Nhập tay khi đăng tin (chưa định vị)",
});
