import { AppError } from '../utils/AppError';
import { noticeRepository } from '../repositories/notice.repository';

export class NoticeService {
  async createNotice(data: any, createdBy: string) {
    const parsedData = { ...data, date: new Date(data.date), createdBy };
    return noticeRepository.create(parsedData);
  }

  async getNotices(filters: { isImportant?: boolean }, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [notices, total] = await Promise.all([
      noticeRepository.findAll(filters, skip, limit),
      noticeRepository.count(filters)
    ]);

    return {
      notices,
      pagination: { total, page, pages: Math.ceil(total / limit) }
    };
  }

  async getNoticeById(id: number) {
    const notice = await noticeRepository.findById(id);
    if (!notice) throw new AppError('Notice not found', 404);
    return notice;
  }

  async updateNotice(id: number, data: any) {
    await this.getNoticeById(id); // exists check
    if (data.date) data.date = new Date(data.date);
    return noticeRepository.update(id, data);
  }

  async deleteNotice(id: number) {
    await this.getNoticeById(id);
    return noticeRepository.delete(id);
  }
}

export const noticeService = new NoticeService();
