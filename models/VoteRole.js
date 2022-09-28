import { Model, DataTypes } from 'sequelize';
export class VoteRole extends Model {
    static m_init(sequelize) {
        VoteRole.init({
            server_id: {
                type: DataTypes.STRING,
                allowNull: false
            },
            role_id: {
                type: DataTypes.STRING,
                allowNull: false
            },
            votes_needed: {
                type: DataTypes.NUMBER,
                allowNull: false,
                defaultValue: 1,
            },
            reaction_id: {
                type: DataTypes.STRING,
                allowNull: true
            }
        }, { sequelize, timestamps: false });
    }
}
export async function RegisterRoleID(server_id, role_id, votes_needed) {
    try {
        VoteRole.create({ server_id: server_id, role_id: role_id, votes_needed: votes_needed, reaction_id: null });
        return true;
    }
    catch {
        return false;
    }
}
export async function AddReactionID(server_id, role_id, reaction_id) {
    const voteRole = (await VoteRole.findOne({ where: { server_id: server_id, role_id: role_id } }));
    if (voteRole) {
        voteRole.reaction_id = reaction_id;
        return true;
    }
    else {
        return false;
    }
}
