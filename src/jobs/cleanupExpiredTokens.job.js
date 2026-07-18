const cron = require('node-cron');
const { Op } = require('sequelize');
const { RefreshToken, UserOtp } = require('../models');
const logger = require('../config/logger');

// Tous les lundis à minuit — nettoie les tokens expirés ou révoqués et les OTP expirés
const startCleanupJob = () => {
  cron.schedule('0 0 * * 1', async () => {
    try {
      const now = new Date();

      const [deletedTokens, deletedOtps] = await Promise.all([
        RefreshToken.destroy({
          where: {
            [Op.or]: [{ expiresAt: { [Op.lt]: now } }, { revoked: true }],
          },
        }),
        UserOtp.destroy({
          where: {
            [Op.or]: [{ expiresAt: { [Op.lt]: now } }, { isUsed: true }],
          },
        }),
      ]);

      logger.info(
        `[Cleanup] ${deletedTokens} refresh tokens supprimés, ${deletedOtps} OTP supprimés`
      );
    } catch (err) {
      logger.error('[Cleanup] Erreur nettoyage tokens :', { message: err.message });
    }
  });

  logger.info('[Cleanup] Job de nettoyage des tokens planifié (tous les lundis à minuit)');
};

module.exports = { startCleanupJob };
