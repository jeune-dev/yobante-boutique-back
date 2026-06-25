

class GestionAdminService {
    //LISTE DES ADMINS
    static async listerAdmins({ page, limit } = {}) {
        const { page: p, limit: l, offset } = paginate(page, limit);

        const { count, rows } = await Utilisateur.findAndCountAll({
            attributes: { exclude: ['mot_de_passe'] },
            where: { role: 'ADMIN' },
            order: [['createdAt', 'DESC']],
            limit: l,
            offset
        });

        return {
            message: "Liste des admins",
            admins: rows,
            pagination: { total: count, totalPages: Math.ceil(count / l), page: p, limit: l }
        };
    }


    //AJOUTER UN ADMIN

    //SUPPRIMER UN ADMIN

    //MODIFIER UN ADMIN

    //ACTIVER OU DESACTIVER UN ADMIN

}

