// /app/terms/page.tsx
export const dynamic = "force-static";

const VERSION = "2025-08";
const EFFECTIVE = "12/08/2025";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 prose prose-neutral">
      <h1>Điều khoản dịch vụ Tora</h1>
      <p>
        <strong>Phiên bản:</strong> {VERSION} • <strong>Ngày hiệu lực:</strong>{" "}
        {EFFECTIVE}
      </p>

      <p>
        Chào mừng bạn đến với <strong>Tora</strong> (“<em>Nền tảng</em>”, “
        <em>chúng tôi</em>”). Bằng việc tạo tài khoản, truy cập hoặc sử dụng
        Nền tảng và các dịch vụ liên quan, bạn (“<strong>Người dùng</strong>”
        gồm <strong>Người mua</strong> và <strong>Người bán</strong>) xác nhận
        đã đọc, hiểu và đồng ý bị ràng buộc bởi Điều khoản này. Nếu bạn không
        đồng ý, vui lòng ngừng sử dụng Nền tảng.
      </p>

      <h2>1. Phạm vi áp dụng &amp; định nghĩa</h2>
      <ul>
        <li>
          Điều khoản này áp dụng cho toàn bộ tính năng, website, ứng dụng, API,
          nội dung và dịch vụ do Tora cung cấp.
        </li>
        <li>
          “<strong>Giao dịch</strong>” là mọi hành vi đặt mua, bán, thanh toán,
          đánh giá, nhắn tin, khiếu nại phát sinh trên Nền tảng.
        </li>
        <li>
          “<strong>Nội dung do người dùng tạo</strong>” (UGC) gồm văn bản, hình
          ảnh, video, đánh giá, nhận xét, mô tả sản phẩm, thông tin cửa hàng.
        </li>
        <li>
          “<strong>Sản phẩm</strong>” là hàng hoá/dịch vụ được Người bán niêm
          yết và cung cấp thông qua Tora.
        </li>
        <li>
          “<strong>Bên thứ ba</strong>” là các đối tác thanh toán, vận chuyển,
          lưu trữ, phân tích, xác minh danh tính, v.v.
        </li>
      </ul>

      <h2>2. Vai trò của Tora</h2>
      <ul>
        <li>
          Tora là <strong>nền tảng trung gian</strong> kết nối Người mua và
          Người bán. Trừ khi được nêu rõ, Tora <strong>không phải là</strong>{" "}
          bên bán hàng và không sở hữu Sản phẩm.
        </li>
        <li>
          Tora có thể cung cấp dịch vụ hỗ trợ (cổng thanh toán, vận chuyển,
          khuyến mãi…) nhưng việc thực hiện, chất lượng và bảo hành Sản phẩm{" "}
          <strong>thuộc trách nhiệm của Người bán</strong>.
        </li>
        <li>
          Tora có quyền xây dựng, sửa đổi quy trình, chính sách, tiêu chuẩn
          hiển thị nhằm bảo vệ trải nghiệm và an toàn trên Nền tảng.
        </li>
      </ul>

      <h2>3. Tài khoản &amp; bảo mật</h2>
      <ul>
        <li>
          Bạn phải đủ <strong>18 tuổi</strong> hoặc có sự đồng ý hợp pháp của
          người giám hộ để sử dụng Nền tảng.
        </li>
        <li>
          Thông tin đăng ký phải <strong>chính xác, đầy đủ, cập nhật</strong>;
          Tora có thể yêu cầu xác minh email/điện thoại/giấy tờ.
        </li>
        <li>
          Bạn chịu trách nhiệm bảo mật thông tin đăng nhập, mọi hoạt động dưới
          tài khoản và thông báo ngay cho Tora khi nghi ngờ truy cập trái phép.
        </li>
        <li>
          Nghiêm cấm: mạo danh, tạo nhiều tài khoản để trục lợi, bán/chuyển
          nhượng tài khoản trái phép, can thiệp kỹ thuật.
        </li>
      </ul>

      <h2>4. Niêm yết &amp; trách nhiệm của Người bán</h2>
      <ul>
        <li>
          Người bán phải đảm bảo thông tin Sản phẩm{" "}
          <strong>trung thực, chính xác, không gây nhầm lẫn</strong>: giá, ảnh,
          tình trạng, nguồn gốc, tiêu chuẩn, chính sách đổi trả/bảo hành.
        </li>
        <li>
          Người bán chịu trách nhiệm <strong>tuân thủ pháp luật</strong> về
          kinh doanh, ghi nhãn, an toàn, kiểm định, sở hữu trí tuệ, thuế, hoá
          đơn, kiểm soát chất lượng.
        </li>
        <li>
          Không được niêm yết Sản phẩm cấm hoặc hạn chế theo pháp luật/Chính
          sách của Tora (xem Mục 8).
        </li>
        <li>
          Tora có quyền <strong>ẩn/xoá</strong> niêm yết,{" "}
          <strong>tạm dừng cửa hàng</strong> hoặc{" "}
          <strong>thu hồi quyền lợi khuyến mãi</strong> khi phát hiện vi phạm.
        </li>
      </ul>

      <h2>5. Đặt hàng &amp; hình thành hợp đồng</h2>
      <ul>
        <li>
          Đơn hàng hình thành khi Người mua đặt và Người bán{" "}
          <strong>xác nhận</strong> (bằng tay hoặc theo cơ chế tự động).
        </li>
        <li>
          Người bán phải xử lý đơn trong thời hạn công bố; nếu quá hạn, Tora có
          thể tự động huỷ đơn để bảo vệ Người mua.
        </li>
        <li>
          Người mua có trách nhiệm kiểm tra lại thông tin đặt hàng (địa chỉ, số
          lượng, tuỳ chọn…) trước khi thanh toán.
        </li>
      </ul>

      <h2>6. Giá, phí &amp; thanh toán</h2>
      <ul>
        <li>
          Giá hiển thị có thể <strong>chưa bao gồm</strong> thuế, phí vận
          chuyển, phí dịch vụ; các khoản này sẽ được thể hiện rõ trước khi
          thanh toán.
        </li>
        <li>
          Thanh toán được xử lý bởi đối tác (ví dụ Stripe). Khi thanh toán, bạn
          đồng ý với điều khoản của đối tác đó.
        </li>
        <li>
          Trường hợp hoàn tiền, thời điểm nhận được tiền phụ thuộc vào quy
          trình của cổng thanh toán/ngân hàng.
        </li>
        <li>
          Tora có thể thu một số khoản phí dịch vụ/hoa hồng/đăng tin, được công
          bố riêng theo từng thời kỳ.
        </li>
      </ul>

      <h2>7. Vận chuyển, giao nhận &amp; rủi ro</h2>
      <ul>
        <li>
          Phí, thời gian và phương thức vận chuyển do Người bán/đối tác vận
          chuyển quy định.
        </li>
        <li>
          Rủi ro mất mát/hư hỏng Sản phẩm <strong>chuyển sang Người mua</strong>{" "}
          khi hàng đã được giao thành công theo chứng từ giao nhận.
        </li>
        <li>
          Người mua cần kiểm tra tình trạng Sản phẩm khi nhận; nếu có vấn đề,
          hãy ghi chú/đồng kiểm với đơn vị giao hàng và liên hệ ngay Người
          bán/Tora.
        </li>
      </ul>

      <h2>8. Sản phẩm &amp; hành vi bị cấm</h2>
      <ul>
        <li>
          Cấm tuyệt đối: hàng giả, hàng xâm phạm SHTT; vũ khí, ma tuý, chất nổ;
          động vật hoang dã; nội dung khiêu dâm/trẻ em; hàng cấm theo pháp luật.
        </li>
        <li>
          Hạn chế/điều kiện: dược phẩm, thực phẩm chức năng, thiết bị y tế, mỹ
          phẩm, đồ uống có cồn, thuốc lá/thuốc lá điện tử, sản phẩm người lớn…
          theo quy định.
        </li>
        <li>
          Cấm gian lận: giả mạo đơn, nâng/ép giá, thao túng đánh giá, lừa đảo
          khuyến mãi, lợi dụng lỗ hổng hệ thống, phát tán mã độc, scraping trái
          phép.
        </li>
      </ul>

      <h2>9. Đổi trả, hoàn tiền &amp; bảo hành</h2>
      <ul>
        <li>
          Chính sách đổi trả/bảo hành do <strong>Người bán công bố</strong> và
          phải tuân thủ pháp luật bảo vệ quyền lợi người tiêu dùng.
        </li>
        <li>
          Tora có thể cung cấp công cụ hỗ trợ yêu cầu đổi trả/hoàn tiền; quyết
          định cuối cùng căn cứ chính sách công bố, chứng cứ và pháp luật áp
          dụng.
        </li>
        <li>
          Trường hợp bất khả kháng (Mục 18), các bên sẽ được gia hạn hợp lý
          hoặc hủy giao dịch không phạt nếu không thể thực hiện.
        </li>
      </ul>

      <h2>10. Đánh giá, bình luận &amp; nội dung do người dùng tạo</h2>
      <ul>
        <li>
          Bạn chỉ đăng <strong>nội dung hợp pháp, đúng sự thật</strong>, không
          xúc phạm, không xâm phạm quyền riêng tư/SHTT.
        </li>
        <li>
          Bằng việc đăng tải, bạn cấp cho Tora{" "}
          <strong>
            giấy phép không độc quyền, toàn cầu, miễn phí bản quyền, có thể
            chuyển giao/cho phép lại
          </strong>
          , để lưu trữ, hiển thị, phân phối, chỉnh sửa kích thước nhằm vận hành
          Nền tảng.
        </li>
        <li>
          Tora có quyền <strong>ẩn, sửa chính tả, xoá</strong> nội dung vi phạm
          hoặc không phù hợp.
        </li>
      </ul>

      <h2>11. Khuyến mãi, mã giảm giá, coin/điểm &amp; ví (nếu có)</h2>
      <ul>
        <li>
          Mã giảm giá/coin/điểm/ưu đãi (“Ưu đãi”) có{" "}
          <strong>điều kiện sử dụng</strong> riêng (thời hạn, đối tượng, sản
          phẩm áp dụng, giới hạn).
        </li>
        <li>
          Tora có quyền thu hồi Ưu đãi đã cấp nếu phát hiện{" "}
          <strong>gian lận/lạm dụng</strong> hoặc lỗi hệ thống. Ưu đãi không
          quy đổi tiền mặt, không chuyển nhượng trừ khi nêu rõ.
        </li>
        <li>
          Số dư ví nội bộ (nếu có) chỉ dùng trong Nền tảng theo điều kiện công
          bố; không phải tài khoản thanh toán theo luật ngân hàng.
        </li>
      </ul>

      <h2>12. Sở hữu trí tuệ &amp; sử dụng nền tảng</h2>
      <ul>
        <li>
          Mọi quyền đối với logo, giao diện, phần mềm, nội dung mặc định thuộc
          Tora/đối tác cấp phép.
        </li>
        <li>
          Nghiêm cấm: sao chép, sửa đổi, dịch ngược, khai thác thương mại khi
          chưa có chấp thuận bằng văn bản.
        </li>
        <li>
          Bạn đồng ý không gây quá tải hệ thống, không dùng bot/bypass, không
          thu thập dữ liệu trái phép.
        </li>
      </ul>

      <h2>13. Dữ liệu cá nhân &amp; bảo mật</h2>
      <ul>
        <li>
          Việc thu thập, sử dụng, lưu trữ và bảo vệ dữ liệu cá nhân thực hiện
          theo <strong>Chính sách bảo mật Tora</strong> (trang <code>/privacy</code>).
        </li>
        <li>
          Mật khẩu lưu dưới dạng băm; truyền dẫn nhạy cảm qua HTTPS; áp dụng
          kiểm soát truy cập nội bộ phù hợp.
        </li>
      </ul>

      <h2>14. Dịch vụ &amp; nội dung bên thứ ba</h2>
      <ul>
        <li>
          Nền tảng có thể tích hợp dịch vụ bên thứ ba (thanh toán, vận chuyển,
          phân tích, bản đồ, đăng nhập OAuth…). Bạn đồng ý với điều khoản của
          các bên này khi sử dụng.
        </li>
        <li>
          Tora không chịu trách nhiệm về nội dung, chính sách hay sự cố do bên
          thứ ba gây ra ngoài phạm vi kiểm soát hợp lý của Tora.
        </li>
      </ul>

      <h2>15. Thuế &amp; hoá đơn</h2>
      <ul>
        <li>
          Người bán có trách nhiệm kê khai, nộp thuế, xuất hoá đơn theo quy
          định.
        </li>
        <li>
          Tora có thể hỗ trợ công cụ/hoá đơn điện tử theo thỏa thuận và pháp
          luật.
        </li>
      </ul>

      <h2>16. Giới hạn trách nhiệm &amp; miễn trừ</h2>
      <ul>
        <li>
          Dịch vụ cung cấp theo nguyên tắc “<strong>nguyên trạng</strong>” và “
          <strong>khả dụng</strong>”.
        </li>
        <li>
          Trong phạm vi luật cho phép, Tora{" "}
          <strong>không chịu trách nhiệm</strong> cho: (a) thiệt hại gián tiếp,
          đặc biệt, hệ quả; (b) mất dữ liệu, mất lợi nhuận; (c) hành vi, thiếu
          sót của Người bán, đơn vị vận chuyển, bên thứ ba.
        </li>
        <li>
          Tổng trách nhiệm của Tora (nếu có) đối với mọi khiếu nại phát sinh từ
          Điều khoản này <strong>không vượt quá</strong> số phí dịch vụ mà bạn
          đã trả cho Tora trong <strong>3 tháng</strong> gần nhất.
        </li>
      </ul>

      <h2>17. Bồi thường</h2>
      <p>
        Bạn đồng ý bồi thường, bảo vệ và giữ cho Tora, nhân viên và đối tác của
        Tora không bị thiệt hại trước mọi khiếu nại, tổn thất, chi phí (kể cả
        phí luật sư hợp lý) phát sinh từ việc bạn vi phạm Điều khoản hoặc xâm
        phạm quyền của bên thứ ba.
      </p>

      <h2>18. Bất khả kháng</h2>
      <p>
        Không bên nào chịu trách nhiệm khi không thực hiện nghĩa vụ do sự kiện
        bất khả kháng: thiên tai, dịch bệnh, chiến tranh, đình công, sự cố hạ
        tầng, lệnh của cơ quan nhà nước… Bên bị ảnh hưởng phải thông báo kịp
        thời và nỗ lực khắc phục.
      </p>

      <h2>19. Tạm ngừng, chấm dứt &amp; xử lý vi phạm</h2>
      <ul>
        <li>
          Tora có thể tạm ngừng/chấm dứt cung cấp dịch vụ, hạn chế tính năng,
          thu hồi Ưu đãi, đóng băng/thu hồi số dư vi phạm khi có dấu hiệu gian
          lận, vi phạm pháp luật hoặc Điều khoản.
        </li>
        <li>
          Tora có thể lưu giữ bằng chứng và phối hợp cơ quan chức năng khi cần.
        </li>
        <li>
          Một số điều khoản (SHTT, dữ liệu cá nhân, giới hạn trách nhiệm, bồi
          thường) vẫn có hiệu lực sau chấm dứt.
        </li>
      </ul>

      <h2>20. Sửa đổi Điều khoản</h2>
      <ul>
        <li>
          Tora có thể cập nhật Điều khoản bất cứ lúc nào; phiên bản mới sẽ đăng
          tải công khai và ghi ngày hiệu lực.
        </li>
        <li>
          Với thay đổi trọng yếu, Tora sẽ thông báo và có thể yêu cầu bạn{" "}
          <strong>đồng ý lại</strong> trước khi tiếp tục sử dụng.
        </li>
      </ul>

      <h2>21. Luật áp dụng &amp; giải quyết tranh chấp</h2>
      <ul>
        <li>
          Điều khoản này chịu sự điều chỉnh của{" "}
          <strong>pháp luật Việt Nam</strong> (có thể thay bằng pháp luật khác
          nếu phù hợp hoạt động của bạn).
        </li>
        <li>
          Tranh chấp sẽ ưu tiên giải quyết bằng thương lượng; nếu không thành,
          đưa ra <strong>Tòa án có thẩm quyền</strong> tại nơi Tora đăng ký kinh
          doanh, trừ khi pháp luật bắt buộc khác đi.
        </li>
      </ul>

      <h2>22. Thông báo &amp; liên hệ</h2>
      <ul>
        <li>
          Thông báo của Tora có thể gửi qua email, thông báo đẩy, SMS, hoặc
          đăng trên Nền tảng và có hiệu lực kể từ thời điểm gửi/đăng.
        </li>
        <li>
          Liên hệ hỗ trợ: <strong>support@tora.example</strong> | Địa chỉ: [bổ
          sung địa chỉ pháp lý].
        </li>
      </ul>

      <h2>23. Điều khoản chung</h2>
      <ul>
        <li>
          Nếu một phần của Điều khoản bị vô hiệu, các phần còn lại vẫn có hiệu
          lực.
        </li>
        <li>
          Bạn không được chuyển nhượng quyền/nghĩa vụ theo Điều khoản nếu không
          có chấp thuận của Tora; Tora có thể chuyển nhượng trong trường hợp tái
          cấu trúc/doanh nghiệp kế thừa.
        </li>
        <li>
          Điều khoản này cấu thành toàn bộ thỏa thuận giữa bạn và Tora về việc
          sử dụng Nền tảng.
        </li>
      </ul>

      <hr />
      <p className="text-sm">
        *Bản mẫu tham khảo — vui lòng điều chỉnh theo mô hình kinh doanh, địa
        bàn hoạt động và tham vấn luật sư khi cần.*
      </p>
    </main>
  );
}
