import serviceModel from "../modules/services/service.model";
import config from "../config";
import userModel from "../modules/User/user.model";

const admin = {
  name: "MD Admin",
  email: "admin@gmail.com",
  password: "1qazxsw2",
  role: "ADMIN",
  isDeleted: false,
};

const serviceData = [
  {
    name: "Pool Cleaning",
    description:
      "Experience a hassle-free and pristine swimming environment with our comprehensive pool cleaning service. Our professional team is equipped with the latest tools and expertise to ensure your pool remains clean, safe, and inviting.",
    image: {
      publicFileURL: "images/users/swimming-pool-4.png",
      path: "public/images/services/pool.png",
    },
    type: "POOL_CLEANING",
  },
  {
    name: "Pool Remodeling",
    description:
      "Experience a hassle-free and pristine swimming environment with our comprehensive pool cleaning service. Our professional team is equipped with the latest tools and expertise to ensure your pool remains clean, safe, and inviting.",
    image: {
      publicFileURL: "images/users/swimming-pool-4.png",
      path: "public/images/services/pool.png",
    },
    type: "POOL_REMODELING",
  },
  {
    name: "Spa Service",
    description:
      "Experience a hassle-free and pristine swimming environment with our comprehensive pool cleaning service. Our professional team is equipped with the latest tools and expertise to ensure your pool remains clean, safe, and inviting.",
    image: {
      publicFileURL: "images/users/swimming-pool-4.png",
      path: "public/images/services/pool.png",
    },
    type: "SPA_SERVICE",
  },
];

const seedSuperAdmin = async () => {
  const isSuperAdminExists = await userModel.findOne({ email: admin.email });
  
  if (!isSuperAdminExists) {
    console.log("Super Admin created");
    await userModel.create(admin);
  }
 
  for (let i = 0; i < serviceData.length; i++) {
    const service = serviceData[i];
    // console.log("service: ", service);
    
    const isServiceExists = await serviceModel.findOne({ type: service.type });
    if (!isServiceExists) {
      console.log("service: ");
      
      await serviceModel.create(service);
    }
  }
};

export default seedSuperAdmin;
