// ─────────────────────────────────────────────────────────────
// services/admin/user.service.js
// ─────────────────────────────────────────────────────────────
const { User } = require('../../models');
const paginate = require('../../utils/paginate');
const { toCsv } = require('../../utils/csv');

class GestionUserService {

    //LISTE DES CLIENTS
    static async listerClients({ page, limit } = {}) {
        const { page: p, limit: l, offset } = paginate(page, limit);

        const { count, rows } = await User.findAndCountAll({
            attributes: { exclude: ['password'] },
            where: { role: 'CLIENT' },
            order: [['createdAt', 'DESC']],
            limit: l,
            offset
        });

        return {
            message: "Liste des clients",
            clients: rows,
            pagination: { total: count, totalPages: Math.ceil(count / l), page: p, limit: l }
        };
    }

    //NOMBRE DE CLIENTS
    static async nombreClients() {
        const total = await User.count({ where: { role: 'CLIENT' } });

        return {
            message: "Nombre total de clients",
            totalClients: total
        };
    }

    //ACTIVER UN CLIENT
    static async activerUser(id) {
        const user = await User.findByPk(id);
        if (!user) {
            return { success: false, message: "Utilisateur introuvable" };
        }

        await user.update({ isActive: true });

        return { success: true, message: "Utilisateur activé avec succès", user };
    }

    //DESACTIVER UN CLIENT
    static async desactiverUser(id) {
        const user = await User.findByPk(id);
        if (!user) {
            return { success: false, message: "Utilisateur introuvable" };
        }

        await user.update({ isActive: false });

        return { success: true, message: "Utilisateur désactivé avec succès", user };
    }

// TODO: getUserById(id)
//   - Trouver l'user avec ses commandes (include Commande)
//   - Lever une erreur 404 si non trouvé
//   - Retourner l'user sans le champ password

// TODO: deleteUser(id)
//   - Vérifier que l'user existe et n'est pas admin
//   - Suppression soft : anonymiser les données personnelles
//   - Retourner un message de succès

    //EXPORT DES CLIENTS EN CSV
    static async exportUsers() {
        const clients = await User.findAll({
            where: { role: 'CLIENT' },
            order: [['createdAt', 'DESC']],
        });

        const rows = clients.map((c) => ({
            nom: c.nom,
            prenom: c.prenom,
            email: c.email,
            telephone: c.telephone || '',
            isActive: c.isActive ? 'actif' : 'inactif',
            isVerified: c.isVerified ? 'oui' : 'non',
            dateInscription: c.createdAt.toISOString().slice(0, 10),
        }));

        const csv = toCsv(rows, [
            { key: 'nom', label: 'Nom' },
            { key: 'prenom', label: 'Prénom' },
            { key: 'email', label: 'Email' },
            { key: 'telephone', label: 'Téléphone' },
            { key: 'isActive', label: 'Statut' },
            { key: 'isVerified', label: 'Vérifié' },
            { key: 'dateInscription', label: 'Date inscription' },
        ]);

        return { success: true, csv };
    }

}

module.exports = GestionUserService;
