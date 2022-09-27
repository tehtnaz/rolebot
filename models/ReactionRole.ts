import { Model, InferAttributes, InferCreationAttributes, Sequelize, DataTypes} from 'sequelize';
export class ReactionRole extends Model<InferAttributes<ReactionRole>, InferCreationAttributes<ReactionRole>> {
    declare server_id: string;
    //role id
    declare role_id: string;
    //level
    declare level: number;
    
    public static m_init(sequelize: Sequelize) {
        ReactionRole.init({
            server_id: {
                type: DataTypes.STRING,
                allowNull: false
            },
            role_id: {
                type: DataTypes.STRING,
                allowNull: false
            },
            level: {
                type: DataTypes.NUMBER,
                allowNull: false,
                defaultValue: 0,
            }
        }, {sequelize, timestamps: false});
    }
    
}