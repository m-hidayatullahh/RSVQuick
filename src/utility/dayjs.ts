import dayjs from "dayjs";
import "dayjs/locale/id";
import "dayjs/locale/en";
import advancedFormat from "dayjs/plugin/advancedFormat";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);
dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);

// Semua tanggal ditampilkan dalam zona waktu WIB (Asia/Jakarta, UTC+7)
dayjs.tz.setDefault("Asia/Jakarta");
dayjs.locale("id");

export default dayjs;
