import config from "../config";
import userModel from "../modules/User/user.model";



const admin = {
    name: 'MD Admin',
    email: 'admin@gmail.com',
    password: config.superAdminPassword,
    role: 'ADMIN',
    isDeleted: false
}


const seedSuperAdmin = async () => {
    const isSuperAdminExists = await userModel.findOne({ email: admin.email })
    if(!isSuperAdminExists) {
        await userModel.create(admin)
    }
}

export default seedSuperAdmin;