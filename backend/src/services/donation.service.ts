import { donationRepository } from '../repositories/donation.repository';

export class DonationService {
  async submitDonation(data: any, userId?: string) {
    const payload = {
      donorName: data.name,
      phone: data.phone,
      amount: data.amount,
      purpose: data.purpose,
      message: data.message,
      donorUserId: userId
    };
    return donationRepository.create(payload);
  }

  async getDonations(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [donations, total] = await Promise.all([
      donationRepository.findAll(skip, limit),
      donationRepository.count()
    ]);

    return {
      donations,
      pagination: { total, page, pages: Math.ceil(total / limit) }
    };
  }

  async getStats() {
    return donationRepository.getStats();
  }
}

export const donationService = new DonationService();
