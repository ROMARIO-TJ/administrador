import prisma from '../../config/db.js';

export class SettingsService {
  /**
   * Obtener la configuración general de la academia (Institucional, Financiera, Apariencia)
   */
  static async getSettings() {
    let settings = await prisma.academySetting.findFirst();
    if (!settings) {
      settings = await prisma.academySetting.create({
        data: {
          academyName: 'Unión Jaguera FC',
          shortName: 'UJFC',
          address: 'La Jagua de Ibirico, Cesar, Colombia',
          city: 'La Jagua de Ibirico',
          department: 'Cesar',
          country: 'Colombia',
          phone: '+57 300 000 0000',
          whatsapp: '+57 300 000 0000',
          email: 'contacto@unionjaguerafc.com',
          website: 'https://unionjaguerafc.com',
          nit: '900.000.000-1',
          representative: 'Junta Directiva Unión Jaguera FC',
          registrationFee: 50000.0,
          monthlyFee: 50000.0,
          dueDay: 10,
          currency: 'COP',
          currencySymbol: '$',
          allowDiscounts: true,
          allowPartialPayments: true,
          primaryColor: '#2563EB',
          secondaryColor: '#64748B',
          buttonColor: '#2563EB',
          dashboardColor: '#0F172A',
          themeMode: 'LIGHT'
        }
      });
    }

    const activeSeason = await prisma.season.findFirst({ where: { status: 'ACTIVE' } });

    return {
      settings,
      activeSeason
    };
  }

  /**
   * Actualizar Información Institucional
   */
  static async updateInstitutionalSettings(data) {
    let settings = await prisma.academySetting.findFirst();
    if (!settings) {
      return await this.getSettings();
    }

    const updated = await prisma.academySetting.update({
      where: { id: settings.id },
      data: {
        academyName: data.academyName ?? settings.academyName,
        shortName: data.shortName ?? settings.shortName,
        logo: data.logo !== undefined ? data.logo : settings.logo,
        favicon: data.favicon !== undefined ? data.favicon : settings.favicon,
        address: data.address ?? settings.address,
        city: data.city ?? settings.city,
        department: data.department ?? settings.department,
        country: data.country ?? settings.country,
        phone: data.phone ?? settings.phone,
        whatsapp: data.whatsapp ?? settings.whatsapp,
        email: data.email ?? settings.email,
        website: data.website ?? settings.website,
        nit: data.nit ?? settings.nit,
        representative: data.representative ?? settings.representative,
        description: data.description !== undefined ? data.description : settings.description
      }
    });

    return updated;
  }

  /**
   * Actualizar Configuración Financiera
   */
  static async updateFinancialSettings(data) {
    let settings = await prisma.academySetting.findFirst();
    if (!settings) {
      return await this.getSettings();
    }

    const updated = await prisma.academySetting.update({
      where: { id: settings.id },
      data: {
        registrationFee: data.registrationFee !== undefined ? parseFloat(data.registrationFee) : settings.registrationFee,
        monthlyFee: data.monthlyFee !== undefined ? parseFloat(data.monthlyFee) : settings.monthlyFee,
        dueDay: data.dueDay !== undefined ? parseInt(data.dueDay) : settings.dueDay,
        currency: data.currency ?? settings.currency,
        currencySymbol: data.currencySymbol ?? settings.currencySymbol,
        allowDiscounts: data.allowDiscounts !== undefined ? Boolean(data.allowDiscounts) : settings.allowDiscounts,
        allowPartialPayments: data.allowPartialPayments !== undefined ? Boolean(data.allowPartialPayments) : settings.allowPartialPayments
      }
    });

    return updated;
  }

  /**
   * Actualizar Apariencia
   */
  static async updateAppearanceSettings(data) {
    let settings = await prisma.academySetting.findFirst();
    if (!settings) {
      return await this.getSettings();
    }

    const updated = await prisma.academySetting.update({
      where: { id: settings.id },
      data: {
        primaryColor: data.primaryColor ?? settings.primaryColor,
        secondaryColor: data.secondaryColor ?? settings.secondaryColor,
        buttonColor: data.buttonColor ?? settings.buttonColor,
        dashboardColor: data.dashboardColor ?? settings.dashboardColor,
        themeMode: data.themeMode ?? settings.themeMode,
        logo: data.logo !== undefined ? data.logo : settings.logo,
        favicon: data.favicon !== undefined ? data.favicon : settings.favicon
      }
    });

    return updated;
  }

  /* ===================== TEMPORADAS DEPORTIVAS ===================== */
  static async getSeasons() {
    return await prisma.season.findMany({
      orderBy: { startDate: 'desc' }
    });
  }

  static async createSeason(data) {
    const { name, startDate, endDate, status } = data;
    if (!name || !startDate || !endDate) {
      throw new Error('Nombre, fecha inicio y fecha fin son obligatorios');
    }

    if (status === 'ACTIVE') {
      await prisma.season.updateMany({
        where: { status: 'ACTIVE' },
        data: { status: 'INACTIVE' }
      });
    }

    return await prisma.season.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: status || 'ACTIVE'
      }
    });
  }

  static async updateSeason(id, data) {
    const seasonId = parseInt(id);
    const { name, startDate, endDate, status } = data;

    if (status === 'ACTIVE') {
      await prisma.season.updateMany({
        where: { id: { not: seasonId }, status: 'ACTIVE' },
        data: { status: 'INACTIVE' }
      });
    }

    return await prisma.season.update({
      where: { id: seasonId },
      data: {
        name: name !== undefined ? name : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        status: status !== undefined ? status : undefined
      }
    });
  }

  static async deleteSeason(id) {
    const seasonId = parseInt(id);
    return await prisma.season.delete({ where: { id: seasonId } });
  }

  static async setActiveSeason(id) {
    const seasonId = parseInt(id);
    await prisma.season.updateMany({
      data: { status: 'INACTIVE' }
    });
    return await prisma.season.update({
      where: { id: seasonId },
      data: { status: 'ACTIVE' }
    });
  }

  /* ===================== CATEGORÍAS DE ALUMNOS ===================== */
  static async getCategories() {
    const categories = await prisma.category.findMany({
      include: {
        _count: { select: { students: true } }
      },
      orderBy: [{ order: 'asc' }, { name: 'asc' }]
    });

    return categories.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      color: c.color,
      minAge: c.minAge,
      maxAge: c.maxAge,
      order: c.order,
      studentCount: c._count.students
    }));
  }

  static async createCategory(data) {
    const { name, description, color, minAge, maxAge, order } = data;
    if (!name) throw new Error('El nombre de la categoría es obligatorio');

    return await prisma.category.create({
      data: {
        name,
        description,
        color: color || '#2563EB',
        minAge: minAge !== undefined ? parseInt(minAge) : 4,
        maxAge: maxAge !== undefined ? parseInt(maxAge) : 20,
        order: order !== undefined ? parseInt(order) : 0
      }
    });
  }

  static async updateCategory(id, data) {
    const categoryId = parseInt(id);
    const { name, description, color, minAge, maxAge, order } = data;

    return await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        color: color !== undefined ? color : undefined,
        minAge: minAge !== undefined ? parseInt(minAge) : undefined,
        maxAge: maxAge !== undefined ? parseInt(maxAge) : undefined,
        order: order !== undefined ? parseInt(order) : undefined
      }
    });
  }

  static async deleteCategory(id) {
    const categoryId = parseInt(id);
    const studentCount = await prisma.student.count({
      where: { categoryId }
    });

    if (studentCount > 0) {
      throw new Error(`No se puede eliminar la categoría porque tiene ${studentCount} alumno(s) registrado(s)`);
    }

    return await prisma.category.delete({ where: { id: categoryId } });
  }

  /* ===================== MÉTODOS DE PAGO ===================== */
  static async getPaymentMethods() {
    return await prisma.paymentMethod.findMany({
      orderBy: { id: 'asc' }
    });
  }

  static async createPaymentMethod(data) {
    const { name, icon, active } = data;
    if (!name) throw new Error('El nombre del método de pago es obligatorio');

    return await prisma.paymentMethod.create({
      data: {
        name,
        icon,
        active: active !== undefined ? Boolean(active) : true
      }
    });
  }

  static async updatePaymentMethod(id, data) {
    const pmId = parseInt(id);
    const { name, icon, active } = data;

    return await prisma.paymentMethod.update({
      where: { id: pmId },
      data: {
        name: name !== undefined ? name : undefined,
        icon: icon !== undefined ? icon : undefined,
        active: active !== undefined ? Boolean(active) : undefined
      }
    });
  }

  static async togglePaymentMethod(id) {
    const pmId = parseInt(id);
    const pm = await prisma.paymentMethod.findUnique({ where: { id: pmId } });
    if (!pm) throw new Error('Método de pago no encontrado');

    return await prisma.paymentMethod.update({
      where: { id: pmId },
      data: { active: !pm.active }
    });
  }

  /* ===================== CONSECUTIVOS ===================== */
  static async getConsecutives() {
    const lastStudent = await prisma.student.findFirst({ orderBy: { id: 'desc' } });

    const consecutiveIns = await prisma.consecutive.findFirst({ where: { OR: [{ prefix: 'INS-' }, { name: 'REGISTRATION' }, { prefix: 'INS' }] } });
    const consecutiveMen = await prisma.consecutive.findFirst({ where: { OR: [{ prefix: 'MEN-' }, { name: 'MONTHLY_PAYMENT' }, { prefix: 'MEN' }] } });
    const consecutiveRec = await prisma.consecutive.findFirst({ where: { OR: [{ prefix: 'REC-' }, { name: 'RECEIPT' }, { prefix: 'REC' }] } });

    return {
      studentNext: `ALU-${String((lastStudent?.id || 0) + 1).padStart(4, '0')}`,
      registrationNext: consecutiveIns ? `INS-${String(consecutiveIns.currentValue + 1).padStart(6, '0')}` : 'INS-000001',
      monthlyNext: consecutiveMen ? `MEN-${String(consecutiveMen.currentValue + 1).padStart(6, '0')}` : 'MEN-000001',
      receiptNext: consecutiveRec ? `REC-${String(consecutiveRec.currentValue + 1).padStart(6, '0')}` : 'REC-000001'
    };
  }

  static async resetConsecutive(prefix) {
    let name = 'REGISTRATION';
    let pref = 'INS-';

    if (prefix === 'MEN') { name = 'MONTHLY_PAYMENT'; pref = 'MEN-'; }
    else if (prefix === 'REC') { name = 'RECEIPT'; pref = 'REC-'; }

    return await prisma.consecutive.upsert({
      where: { name },
      update: { currentValue: 0 },
      create: { name, prefix: pref, currentValue: 0 }
    });
  }
}
