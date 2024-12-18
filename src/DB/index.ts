import serviceModel from "../modules/services/service.model";
import config from "../config";
import userModel from "../modules/User/user.model";

const admin = {
  name: "MD Admin",
  email: "admin@gmail.com",
  password: "1qazxsw2",
  role: "ADMIN",
  isDeleted: false,
  isVerified: true,
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
    isDelete: false,
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
    isDelete: false,
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
    isDelete: false,
  },
];

const seedSuperAdmin = async () => {
  try {
    const isSuperAdminExists = await userModel.findOne({ email: admin.email });

    if (!isSuperAdminExists) {
      console.log("Super Admin created");
      await userModel.create(admin);
    }

    for (let i = 0; i < serviceData.length; i++) {
      const service = serviceData[i];

      const isServiceExists = await serviceModel.findOne({ type: service.type });
      if (!isServiceExists) {
        console.log("service: ");
        await serviceModel.create(service);
      }
    }
  } catch (error) {
    console.error("Error during seeding:", error);
  }
};


export default seedSuperAdmin;
