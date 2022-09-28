import { Model, InferAttributes, InferCreationAttributes, Sequelize, DataTypes} from 'sequelize';
export class VoteRole extends Model<InferAttributes<VoteRole>, InferCreationAttributes<VoteRole>> {
    declare server_id: string;
    declare role_id: string;
    declare votes_needed: number;
    declare reaction_id: string | null;
    
    public static m_init(sequelize: Sequelize) {
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
        }, {sequelize, timestamps: false});
    }
}

export async function RegisterRoleID(server_id: string, role_id: string, votes_needed: number): Promise<boolean> {
    try{
        VoteRole.create({server_id: server_id, role_id: role_id, votes_needed: votes_needed, reaction_id: null});
        return true;
    }catch{
        return false;
    }
}
export async function AddReactionID(server_id: string, role_id: string, reaction_id: string | null): Promise<boolean> {
    const voteRole = (await VoteRole.findOne({where: {server_id: server_id, role_id: role_id}}));
    if(voteRole){
        voteRole.reaction_id = reaction_id;
        return true;
    }else{
        return false;
    }
}