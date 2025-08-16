// /app/privacy/page.tsx
export const dynamic = "force-static";

const VERSION = "2025-08";
const EFFECTIVE = "12/08/2025";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 prose prose-neutral">
      <h1>Chính sách bảo mật Tora</h1>
      <p>
        <strong>Phiên bản:</strong> {VERSION} • <strong>Ngày hiệu lực:</strong>{" "}
        {EFFECTIVE}
      </p>

      <p>
        Chính sách này giải thích cách <strong>Tora</strong> (“<em>chúng tôi</em>”, “
        <em>Nền tảng</em>”) thu thập, sử dụng, lưu trữ, chia sẻ và bảo vệ dữ liệu
        cá nhân của bạn khi bạn truy cập hoặc sử dụng dịch vụ. Nếu bạn không đồng
        ý với Chính sách, vui lòng ngừng sử dụng Nền tảng.
      </p>

      <h2>1. Phạm vi &amp; đối tượng áp dụng</h2>
      <ul>
        <li>Áp dụng cho tất cả người dùng Tora, gồm Người mua, Người bán và khách truy cập.</li>
        <li>Áp dụng cho toàn bộ website, ứng dụng, API, kênh hỗ trợ và hoạt động tiếp thị của Tora.</li>
      </ul>

      <h2>2. Dữ liệu chúng tôi thu thập</h2>
      <ul>
        <li>
          <strong>Thông tin tài khoản:</strong> email, tên hiển thị, ảnh đại diện; mật khẩu được băm (không lưu mật khẩu dạng thuần).
        </li>
        <li>
          <strong>Hồ sơ &amp; cửa hàng (nếu là Người bán):</strong> tên cửa hàng, mô tả, địa chỉ liên hệ, giấy tờ/đăng ký theo yêu cầu pháp luật.
        </li>
        <li>
          <strong>Thông tin giao dịch:</strong> sản phẩm đã xem/mua/bán, giỏ hàng, địa chỉ giao nhận, hoá đơn/biên nhận, khiếu nại/đổi trả.
        </li>
        <li>
          <strong>Dữ liệu kỹ thuật:</strong> địa chỉ IP, user-agent, loại thiết bị/trình duyệt, ngôn ngữ, cookie/ID phiên, log lỗi và hành vi chống gian lận.
        </li>
        <li>
          <strong>Trao đổi hỗ trợ &amp; phản hồi:</strong> nội dung bạn gửi qua biểu mẫu hỗ trợ, email, đánh giá, bình luận.
        </li>
        <li>
          <strong>Dữ liệu từ bên thứ ba (nếu có):</strong> nhà cung cấp thanh toán, vận chuyển, phân tích, xác minh danh tính, đăng nhập OAuth theo quyền bạn cấp.
        </li>
      </ul>

      <h2>3. Mục đích xử lý</h2>
      <ul>
        <li>Cung cấp, duy trì và cải thiện tính năng của Nền tảng.</li>
        <li>Xử lý đơn hàng, thanh toán, vận chuyển, đổi trả và hỗ trợ sau bán.</li>
        <li>Phòng chống gian lận, an ninh hệ thống, kiểm tra sự cố và ghi log kỹ thuật.</li>
        <li>Cá nhân hoá trải nghiệm, đề xuất nội dung/sản phẩm phù hợp.</li>
        <li>Gửi thông báo giao dịch, nhắc việc; tiếp thị khi có sự đồng ý (có thể từ chối bất cứ lúc nào).</li>
        <li>Tuân thủ nghĩa vụ pháp lý (kế toán, thuế, lưu trữ hoá đơn, phản hồi yêu cầu cơ quan có thẩm quyền).</li>
      </ul>

      <h2>4. Cơ sở pháp lý (nếu luật áp dụng yêu cầu)</h2>
      <ul>
        <li>Thực hiện hợp đồng với bạn (xử lý mua bán, hỗ trợ).</li>
        <li>Lợi ích hợp pháp của Tora (bảo mật, cải tiến sản phẩm, ngăn chặn gian lận) — cân bằng với quyền lợi của bạn.</li>
        <li>Tuân thủ nghĩa vụ pháp lý (kế toán, thuế, lưu trữ).</li>
        <li>Đồng ý của bạn (ví dụ nhận thông tin tiếp thị). Bạn có thể rút lại đồng ý bất kỳ lúc nào.</li>
      </ul>

      <h2>5. Cookie &amp; công nghệ tương tự</h2>
      <ul>
        <li>
          <strong>Cookie bắt buộc:</strong> phục vụ đăng nhập, bảo mật phiên, cân bằng tải — không thể tắt ở mức ứng dụng.
        </li>
        <li>
          <strong>Hiệu suất &amp; phân tích:</strong> đo lường truy cập, sự cố, hiệu năng ở dạng tổng hợp/ẩn danh khi khả dụng.
        </li>
        <li>
          <strong>Tiếp thị (tuỳ chọn):</strong> dùng để đo hiệu quả chiến dịch. Bạn có thể điều chỉnh tại cài đặt cookie (nếu khả dụng) hoặc trình duyệt.
        </li>
      </ul>

      <h2>6. Chia sẻ dữ liệu</h2>
      <p>
        Chúng tôi có thể chia sẻ dữ liệu với các nhà cung cấp dịch vụ (“đơn vị xử lý”) chỉ để vận hành Nền tảng
        và theo chỉ dẫn của Tora, bao gồm: lưu trữ đám mây, gửi email, thanh toán, vận chuyển, phân tích, chống gian lận,
        xác minh danh tính, hỗ trợ khách hàng. Ngoài ra:
      </p>
      <ul>
        <li>
          <strong>Chuyển giao theo luật:</strong> khi có yêu cầu hợp lệ của cơ quan nhà nước hoặc để bảo vệ quyền lợi hợp pháp của Tora/người dùng.
        </li>
        <li>
          <strong>Tái cấu trúc doanh nghiệp:</strong> dữ liệu có thể chuyển nhượng trong sáp nhập, mua bán, phá sản… với điều kiện bảo mật tương đương.
        </li>
        <li>Chúng tôi <strong>không bán</strong> dữ liệu cá nhân của bạn.</li>
      </ul>

      <h2>7. Lưu trữ &amp; chuyển dữ liệu quốc tế</h2>
      <ul>
        <li>Dữ liệu có thể được lưu trữ/ xử lý trên máy chủ đặt tại nhiều quốc gia/khu vực.</li>
        <li>
          Khi chuyển dữ liệu qua biên giới, chúng tôi áp dụng biện pháp bảo vệ phù hợp theo luật áp dụng (ví dụ: điều khoản hợp đồng chuẩn – SCCs).
        </li>
      </ul>

      <h2>8. Thời hạn lưu trữ</h2>
      <ul>
        <li>Tài khoản &amp; hồ sơ: lưu đến khi bạn xoá hoặc tài khoản bị chấm dứt, trừ khi pháp luật yêu cầu thời hạn dài hơn.</li>
        <li>Giao dịch &amp; hoá đơn: theo thời hạn kế toán/thuế bắt buộc.</li>
        <li>Log bảo mật &amp; kỹ thuật: lưu trong thời gian cần thiết để điều tra, phòng chống gian lận và cải thiện dịch vụ.</li>
      </ul>

      <h2>9. Bảo mật thông tin</h2>
      <ul>
        <li>Mật khẩu băm; truyền dữ liệu nhạy cảm qua HTTPS/TLS.</li>
        <li>Kiểm soát truy cập nội bộ, tách quyền, ghi log và sao lưu định kỳ.</li>
        <li>
          Dù nỗ lực bảo vệ, không phương thức nào an toàn tuyệt đối; bạn cũng cần giữ bí mật thông tin đăng nhập và cảnh giác với lừa đảo.
        </li>
      </ul>

      <h2>10. Quyền của bạn</h2>
      <p>Tuỳ luật áp dụng, bạn có thể có các quyền sau:</p>
      <ul>
        <li>Truy cập, đính chính, cập nhật thông tin cá nhân.</li>
        <li>Xoá dữ liệu trong các trường hợp luật định hoặc khi không còn mục đích xử lý hợp pháp.</li>
        <li>Hạn chế/Phản đối xử lý trong một số trường hợp (ví dụ mục đích tiếp thị trực tiếp).</li>
        <li>Yêu cầu bản sao dữ liệu ở định dạng có thể đọc bằng máy (data portability).</li>
        <li>Rút lại sự đồng ý đối với các xử lý dựa trên đồng ý, mà không ảnh hưởng tính hợp pháp trước thời điểm rút.</li>
      </ul>
      <p>
        Để thực hiện, vui lòng liên hệ <a href="mailto:privacy@tora.example">privacy@tora.example</a>.
        Vì an toàn, chúng tôi có thể yêu cầu xác minh danh tính trước khi xử lý.
      </p>

      <h2>11. Tiếp thị &amp; thông báo</h2>
      <ul>
        <li>
          Bạn có thể quản lý nhận thư tiếp thị qua liên kết “Huỷ đăng ký” trong email, hoặc tại phần cài đặt tài khoản (khi khả dụng).
        </li>
        <li>
          Thông báo giao dịch (biên nhận, trạng thái đơn hàng…) là cần thiết cho dịch vụ và có thể không tắt được.
        </li>
      </ul>

      <h2>12. Quyết định tự động &amp; phân loại</h2>
      <p>
        Chúng tôi có thể dùng phân tích tự động để chống gian lận, đề xuất nội dung hoặc xếp hạng hiển thị.
        Bạn có thể liên hệ chúng tôi để biết thêm về logic chung và tác động dự kiến (trong phạm vi luật cho phép).
      </p>

      <h2>13. Trẻ vị thành niên</h2>
      <p>
        Nền tảng không dành cho người dưới 13 tuổi. Nếu phát hiện dữ liệu trẻ em được thu thập không phù hợp,
        chúng tôi sẽ xoá kịp thời sau khi xác minh.
      </p>

      <h2>14. Vi phạm dữ liệu</h2>
      <p>
        Khi xảy ra sự cố ảnh hưởng dữ liệu cá nhân, chúng tôi sẽ đánh giá rủi ro và thông báo cho cơ quan quản lý/người dùng
        theo yêu cầu pháp luật hiện hành.
      </p>

      <h2>15. Thay đổi Chính sách</h2>
      <p>
        Chúng tôi có thể cập nhật Chính sách này. Phiên bản mới sẽ công bố tại trang này kèm ngày hiệu lực; thay đổi trọng yếu
        sẽ được thông báo phù hợp. Việc bạn tiếp tục sử dụng Nền tảng sau ngày hiệu lực đồng nghĩa chấp nhận Chính sách cập nhật.
      </p>

      <h2>16. Liên hệ</h2>
      <p>
        Mọi thắc mắc về quyền riêng tư, vui lòng liên hệ:
        <br />
        Email: <a href="mailto:privacy@tora.example">privacy@tora.example</a>
        <br />
        Hỗ trợ chung: <a href="mailto:support@tora.example">support@tora.example</a>
        <br />
        Địa chỉ công ty: [bổ sung địa chỉ pháp lý]
      </p>

      <h2>17. Tham chiếu &amp; liên kết</h2>
      <p>
        Đọc thêm <a href="/terms">Điều khoản dịch vụ</a> để biết các điều khoản điều chỉnh việc sử dụng Nền tảng của bạn.
      </p>

      <hr />
      <p className="text-sm">
        *Tài liệu mẫu tham khảo. Vui lòng điều chỉnh theo mô hình kinh doanh và tham vấn luật sư khi cần.*
      </p>
    </main>
  );
}
