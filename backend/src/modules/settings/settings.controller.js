import { SettingsService } from './settings.service.js';

export class SettingsController {
  // GET /api/settings
  static async getSettings(req, res, next) {
    try {
      const data = await SettingsService.getSettings();
      return res.json({ success: true, data: data.settings, activeSeason: data.activeSeason });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/settings/institutional
  static async updateInstitutional(req, res, next) {
    try {
      const settings = await SettingsService.updateInstitutionalSettings(req.body);
      return res.json({ success: true, message: 'Información institucional actualizada', data: settings });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/settings/financial
  static async updateFinancial(req, res, next) {
    try {
      const settings = await SettingsService.updateFinancialSettings(req.body);
      return res.json({ success: true, message: 'Configuración financiera actualizada', data: settings });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/settings/appearance
  static async updateAppearance(req, res, next) {
    try {
      const settings = await SettingsService.updateAppearanceSettings(req.body);
      return res.json({ success: true, message: 'Apariencia actualizada', data: settings });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/settings/seasons
  static async getSeasons(req, res, next) {
    try {
      const seasons = await SettingsService.getSeasons();
      return res.json({ success: true, data: seasons });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/settings/seasons
  static async createSeason(req, res, next) {
    try {
      const season = await SettingsService.createSeason(req.body);
      return res.status(201).json({ success: true, message: 'Temporada creada', data: season });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/settings/seasons/:id
  static async updateSeason(req, res, next) {
    try {
      const season = await SettingsService.updateSeason(req.params.id, req.body);
      return res.json({ success: true, message: 'Temporada actualizada', data: season });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/settings/seasons/:id
  static async deleteSeason(req, res, next) {
    try {
      await SettingsService.deleteSeason(req.params.id);
      return res.json({ success: true, message: 'Temporada eliminada' });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/settings/seasons/:id/active
  static async setActiveSeason(req, res, next) {
    try {
      const season = await SettingsService.setActiveSeason(req.params.id);
      return res.json({ success: true, message: 'Temporada establecida como activa', data: season });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/settings/categories
  static async getCategories(req, res, next) {
    try {
      const categories = await SettingsService.getCategories();
      return res.json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/settings/categories
  static async createCategory(req, res, next) {
    try {
      const category = await SettingsService.createCategory(req.body);
      return res.status(201).json({ success: true, message: 'Categoría creada', data: category });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/settings/categories/:id
  static async updateCategory(req, res, next) {
    try {
      const category = await SettingsService.updateCategory(req.params.id, req.body);
      return res.json({ success: true, message: 'Categoría actualizada', data: category });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/settings/categories/:id
  static async deleteCategory(req, res, next) {
    try {
      await SettingsService.deleteCategory(req.params.id);
      return res.json({ success: true, message: 'Categoría eliminada' });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/settings/payment-methods
  static async getPaymentMethods(req, res, next) {
    try {
      const methods = await SettingsService.getPaymentMethods();
      return res.json({ success: true, data: methods });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/settings/payment-methods
  static async createPaymentMethod(req, res, next) {
    try {
      const method = await SettingsService.createPaymentMethod(req.body);
      return res.status(201).json({ success: true, message: 'Método de pago creado', data: method });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/settings/payment-methods/:id
  static async updatePaymentMethod(req, res, next) {
    try {
      const method = await SettingsService.updatePaymentMethod(req.params.id, req.body);
      return res.json({ success: true, message: 'Método de pago actualizado', data: method });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/settings/payment-methods/:id/toggle
  static async togglePaymentMethod(req, res, next) {
    try {
      const method = await SettingsService.togglePaymentMethod(req.params.id);
      return res.json({ success: true, message: 'Estado de método de pago cambiado', data: method });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/settings/consecutives
  static async getConsecutives(req, res, next) {
    try {
      const data = await SettingsService.getConsecutives();
      return res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/settings/consecutives/reset
  static async resetConsecutive(req, res, next) {
    try {
      const { prefix } = req.body;
      const data = await SettingsService.resetConsecutive(prefix);
      return res.json({ success: true, message: `Consecutivo ${prefix} reiniciado a 000000`, data });
    } catch (error) {
      next(error);
    }
  }
}
