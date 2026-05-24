# UniDriver Frontend 👋

# Hướng dẫn cài đặt và chạy dự án

Đây là hướng dẫn chi tiết để cài đặt và chạy dự án React Native.

## 1. Yêu cầu hệ thống

- [Node.js](https://nodejs.org/) (phiên bản 18 trở lên)
- [Yarn](https://yarnpkg.com/) hoặc [npm](https://www.npmjs.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Git](https://git-scm.com/)

## 2. Cài đặt

### Bước 1: Cài đặt các gói phụ thuộc

Sử dụng `npm` hoặc `yarn` để cài đặt các gói cần thiết cho dự án:

```bash
# Sử dụng npm
npm install

```

### Bước 2: Cấu hình biến môi trường

Dự án sử dụng các biến môi trường để quản lý các thông tin nhạy cảm như API URL và khóa Cloudinary.

1.  **Tạo file `.env`:**
    Tạo một file mới có tên là `.env` trong thư mục gốc của dự án.

2.  **Sao chép nội dung từ `.env.example`:**
    Mở file `.env.example`, sao chép toàn bộ nội dung và dán vào file `.env` vừa tạo.

3.  **Điền các giá trị cho biến môi trường:**
    Chỉnh sửa file `.env` và điền các giá trị tương ứng cho các biến sau:

    ```env
    # URL chính của API backend.
    # Ví dụ: http://localhost:8080/api
    EXPO_PUBLIC_API_URL=https://your-api-url.com/api

    # --- Cấu hình Cloudinary để tải ảnh lên ---

    # URL để tải ảnh lên Cloudinary.
    # Lấy từ trang quản trị Cloudinary (ví dụ: https://api.cloudinary.com/v1_1/your_cloud_name/image/upload)
    EXPO_PUBLIC_CLOUDINARY_UPLOAD_URL=https://api.cloudinary.com/v1_1/your_cloud_name/image/upload

    # Tên của "Upload Preset" đã được cấu hình trên Cloudinary.
    # Preset này phải được cài đặt là "Unsigned" để cho phép tải lên trực tiếp từ client.
    # Nó định nghĩa các quy tắc xử lý ảnh khi tải lên (thư mục, kích thước, ...).
    EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset
    ```

    **Lưu ý:**
    - `EXPO_PUBLIC_API_URL`: Thay thế bằng URL của API backend mà bạn đang sử dụng.
    - `EXPO_PUBLIC_CLOUDINARY_UPLOAD_URL`: Thay thế `your_cloud_name` bằng tên cloud của bạn trên Cloudinary.
    - `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET`: Thay thế bằng tên "Upload Preset" bạn đã tạo trên Cloudinary.

## 3. Chạy dự án

Sau khi hoàn tất các bước cài đặt, bạn có thể chạy dự án bằng các lệnh sau:

### Chạy trên môi trường phát triển

Lệnh này sẽ khởi động Metro Bundler và hiển thị mã QR để bạn có thể quét bằng ứng dụng Expo Go trên điện thoại.

**Lưu ý:** Dự án này sử dụng Expo SDK 52. Hãy chắc chắn rằng bạn đang sử dụng phiên bản Expo Go tương thích để quét mã QR và chạy ứng dụng.

```bash
npx expo start
```
