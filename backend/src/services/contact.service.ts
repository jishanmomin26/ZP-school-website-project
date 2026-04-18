import { AppError } from '../utils/AppError';
import { contactRepository } from '../repositories/contact.repository';

export class ContactService {
  async submitMessage(data: any) {
    return contactRepository.create(data);
  }

  async getMessages(filters: { isRead?: boolean }, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [messages, total] = await Promise.all([
      contactRepository.findAll(filters, skip, limit),
      contactRepository.count(filters)
    ]);

    return {
      messages,
      pagination: { total, page, pages: Math.ceil(total / limit) }
    };
  }

  async markAsRead(id: number) {
    return contactRepository.markAsRead(id);
  }
}

export const contactService = new ContactService();
