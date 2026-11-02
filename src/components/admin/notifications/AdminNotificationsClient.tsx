"use client";

import { useState } from "react";
import {
  Bell,
  Megaphone,
  Plus,
  Trash2,
  Users,
  Eye,
  Calendar,
  AlertTriangle,
  Send,
  Radio,
  CheckCircle,
} from "lucide-react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";

interface GradeOption {
  id: string;
  name: string;
  code: string;
}

interface AnnouncementItem {
  id: string;
  title: string;
  message: string;
  type: string;
  targetGradeId: string | null;
  targetSchoolCategory: string | null;
  link: string | null;
  isUrgent: boolean;
  createdAt: string;
  expiresAt: string | null;
  createdBy: { id: string; name: string | null; email: string | null } | null;
  _count: { reads: number };
}

interface AdminNotificationsClientProps {
  initialAnnouncements: AnnouncementItem[];
  grades: GradeOption[];
  pushSubscribersCount: number;
}

export function AdminNotificationsClient({
  initialAnnouncements,
  grades,
  pushSubscribersCount,
}: AdminNotificationsClientProps) {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(initialAnnouncements);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    announcementId: string;
    announcementTitle: string;
  }>({
    isOpen: false,
    announcementId: "",
    announcementTitle: "",
  });

  // Form State
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("ANNOUNCEMENT");
  const [targetGradeId, setTargetGradeId] = useState<string>("");
  const [targetSchoolCategory, setTargetSchoolCategory] = useState<string>("");
  const [link, setLink] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [sendPush, setSendPush] = useState(true);

  // Total reads across all announcements
  const totalReads = announcements.reduce((sum, a) => sum + (a._count?.reads || 0), 0);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          message,
          type,
          targetGradeId: targetGradeId || null,
          targetSchoolCategory: targetSchoolCategory || null,
          link: link.trim() || null,
          isUrgent,
          sendPush,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "فشل إرسال الإشعار");
      }

      const { announcement } = await res.json();
      setAnnouncements((prev) => [
        {
          ...announcement,
          createdBy: { id: "current", name: "أنت", email: null },
          _count: { reads: 0 },
        },
        ...prev,
      ]);

      // Reset form
      setTitle("");
      setMessage("");
      setLink("");
      setIsUrgent(false);
      setTargetGradeId("");
      setTargetSchoolCategory("");
      setIsModalOpen(false);

      const successText = sendPush
        ? "تم إرسال الإشعار وبثه عبر إشعارات المتصفح بنجاح!"
        : "تم حفظ الإشعار ونشره للطلاب بنجاح!";
      setSuccessBanner(successText);
      toast.success(successText);
      setTimeout(() => setSuccessBanner(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء إرسال الإشعار";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (id: string, itemTitle: string) => {
    setConfirmModal({
      isOpen: true,
      announcementId: id,
      announcementTitle: itemTitle,
    });
  };

  const handleConfirmDelete = async () => {
    const id = confirmModal.announcementId;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/notifications/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAnnouncements((prev) => prev.filter((a) => a.id !== id));
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        toast.success("تم حذف الإعلان بنجاح");
      } else {
        toast.error("فشل حذف الإشعار");
      }
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء حذف الإعلان");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto text-right" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0] dark:border-[#334155]">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#800020]/10 dark:bg-[#A30D36]/20 text-[#800020] dark:text-[#FDA4AF] flex items-center justify-center">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                الإعلانات والإشعارات العامة
              </h1>
              <p className="text-xs md:text-sm text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                إرسال إعلانات وتنبيهات مباشرة لجميع الطلاب أو مجموعات مستهدفة مع إمكانية البث عبر إشعارات المتصفح
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="h-10 px-4 rounded-xl bg-[#800020] hover:bg-[#600018] text-white text-sm font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إرسال إشعار جديد</span>
        </button>
      </div>

      {/* Success Banner */}
      {successBanner && (
        <div className="p-4 rounded-xl bg-[#F0FDF4] dark:bg-[#0E2F1B] border border-[#BBF7D0] dark:border-[#14532D] text-[#15803D] dark:text-[#86EFAC] text-sm font-medium flex items-center gap-2">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">إجمالي الإعلانات</span>
            <Bell className="w-4 h-4 text-[#800020] dark:text-[#FDA4AF]" />
          </div>
          <div className="text-2xl font-black font-mono text-[#0F172A] dark:text-[#F8FAFC] mt-2">
            {announcements.length}
          </div>
          <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">إعلان منشور في النظام</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">قراءات وتفاعل الطلاب</span>
            <Eye className="w-4 h-4 text-[#059669]" />
          </div>
          <div className="text-2xl font-black font-mono text-[#0F172A] dark:text-[#F8FAFC] mt-2">
            {totalReads}
          </div>
          <span className="text-[11px] text-[#059669]">عملية فتح وقراءة للإعلانات</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">مشتركو إشعارات المتصفح</span>
            <Radio className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="text-2xl font-black font-mono text-[#0F172A] dark:text-[#F8FAFC] mt-2">
            {pushSubscribersCount}
          </div>
          <span className="text-[11px] text-[#D97706]">جهاز مفعل للإشعارات اللحظية</span>
        </div>
      </div>

      {/* Announcements List */}
      <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between bg-[#F8FAFC] dark:bg-[#1E293B]/50">
          <h3 className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">سجل الإعلانات والتنبيهات السابقة</h3>
          <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">مرتبة من الأحدث إلى الأقدم</span>
        </div>

        {announcements.length === 0 ? (
          <div className="py-16 text-center">
            <Megaphone className="w-10 h-10 mx-auto text-[#94A3B8] mb-3" />
            <h4 className="font-bold text-[#0F172A] dark:text-[#F8FAFC] text-sm">لا توجد إعلانات منشورة حالياً</h4>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
              اضغط على زر «إرسال إشعار جديد» لبث أول إشعار أو تنبيه للطلاب.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E2E8F0] dark:divide-[#334155]">
            {announcements.map((item) => (
              <div key={item.id} className="p-5 hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/30 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">{item.title}</h4>
                      {item.isUrgent && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF2F2] dark:bg-[#3E141B] text-[#DC2626] border border-[#FECDD3] dark:border-[#881337] flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          عاجل
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#F1F5F9] dark:bg-[#1E293B] text-[#475569] dark:text-[#94A3B8]">
                        {item.type === "ANNOUNCEMENT"
                          ? "إعلان عام"
                          : item.type === "COURSE_UPDATE"
                          ? "تحديث مادة"
                          : item.type === "DAILY_EXAM"
                          ? "تحدي يومي"
                          : "تنبيه دراسي"}
                      </span>
                    </div>

                    <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed whitespace-pre-line">
                      {item.message}
                    </p>

                    {item.link && (
                      <div className="text-xs text-[#800020] dark:text-[#FDA4AF] font-medium pt-1">
                        الرابط المرتبط: <span className="font-mono text-[11px] underline">{item.link}</span>
                      </div>
                    )}

                    {/* Metadata Footer */}
                    <div className="flex flex-wrap items-center gap-4 pt-2 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleDateString("ar-EG", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        المستهدف:{" "}
                        {item.targetGradeId
                          ? grades.find((g) => g.id === item.targetGradeId)?.name || "صف محدد"
                          : "جميع الصفوف"}
                        {item.targetSchoolCategory && ` (${item.targetSchoolCategory === "ARABIC" ? "عام" : "لغات"})`}
                      </span>

                      <span className="flex items-center gap-1 text-[#059669] font-semibold">
                        <Eye className="w-3 h-3" />
                        {item._count?.reads || 0} طالب قرأ الإشعار
                      </span>

                      {item.createdBy && (
                        <span>بواسطة: {item.createdBy.name || item.createdBy.email}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDeleteClick(item.id, item.title)}
                      disabled={deletingId === item.id}
                      className="p-2 rounded-lg text-[#DC2626] hover:bg-[#FEF2F2] dark:hover:bg-[#3E141B] transition-colors cursor-pointer disabled:opacity-50"
                      title="حذف الإعلان"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={confirmModal.isOpen}
        title="حذف الإعلان"
        description="هل أنت متأكد من حذف هذا الإعلان نهائياً؟ لا يمكن استرجاعه بعد الحذف."
        itemHighlight={confirmModal.announcementTitle ? `الإعلان المستهدف: ${confirmModal.announcementTitle}` : undefined}
        confirmText="تأكيد الحذف"
        variant="danger"
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDelete}
      />

      {/* Create Announcement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-2xl w-full max-w-lg shadow-2xl p-6 text-right">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] dark:border-[#334155]">
              <h3 className="font-bold text-base text-[#0F172A] dark:text-[#F8FAFC]">
                إنشاء وبث إشعار جديد
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-[#334155] dark:text-[#CBD5E1] mb-1">
                  عنوان الإشعار *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: تم إضافة امتحان شامل جديد في الفيزياء..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-sm text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#800020]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] dark:text-[#CBD5E1] mb-1">
                  نص الرسالة والتفاصيل *
                </label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="اكتب نص الإعلان بالتفصيل للطلاب..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-sm text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#800020]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#334155] dark:text-[#CBD5E1] mb-1">
                    تصنيف الإشعار
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-sm text-[#0F172A] dark:text-[#F8FAFC]"
                  >
                    <option value="ANNOUNCEMENT">إعلان عام</option>
                    <option value="COURSE_UPDATE">تحديث محتوى أو منهج</option>
                    <option value="DAILY_EXAM">تحدي يومي</option>
                    <option value="SYSTEM">تنبيه نظامي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#334155] dark:text-[#CBD5E1] mb-1">
                    الفئة المستهدفة
                  </label>
                  <select
                    value={targetSchoolCategory}
                    onChange={(e) => setTargetSchoolCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-sm text-[#0F172A] dark:text-[#F8FAFC]"
                  >
                    <option value="">كافة المدارس (عربي ولغات)</option>
                    <option value="ARABIC">مدارس عربي فقط</option>
                    <option value="LANGUAGES">مدارس لغات فقط</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] dark:text-[#CBD5E1] mb-1">
                  الصف الدراسي المستهدف
                </label>
                <select
                  value={targetGradeId}
                  onChange={(e) => setTargetGradeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-sm text-[#0F172A] dark:text-[#F8FAFC]"
                >
                  <option value="">جميع الصفوف الدراسية</option>
                  {grades.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#334155] dark:text-[#CBD5E1] mb-1">
                  رابط توجيه اختياري
                </label>
                <input
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="/exams أو /dashboard أو رابط خارجي"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B] text-sm text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#800020]"
                />
              </div>

              <div className="pt-2 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="w-4 h-4 rounded text-[#800020] focus:ring-[#800020]"
                  />
                  <span className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                    تمييز كإشعار عاجل أو استثنائي (Urgent Notification)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendPush}
                    onChange={(e) => setSendPush(e.target.checked)}
                    className="w-4 h-4 rounded text-[#800020] focus:ring-[#800020]"
                  />
                  <span className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                    بث إشعار فوري لمتصفحات وهواتف الطلاب (Web Push Notification)
                  </span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-[#E2E8F0] dark:border-[#334155]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B] font-semibold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#800020] hover:bg-[#600018] text-white font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "جاري الإرسال..." : "إرسال الإشعار الآن"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
