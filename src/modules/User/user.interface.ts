 interface IUser {
  name: string;
  email: string;
  password: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
  privacyPolicyAccepted?: boolean;
  isAdmin: boolean;
  isProfileCompleted: boolean;
  isVerified: boolean;
  isDeleted: boolean;
  isBlocked: boolean;
  isEmployee: boolean;
  image?: {
    publicFileURL: string;
    path: string;
  };
  licenceFront?: {
    publicFileURL: string;
    path: string;
  };
  licenceBack?: {
    publicFileURL: string;
    path: string;
  };
  role: "USER" | "EMPLOYEE" | "ADMIN" | "MANAGER";
  oneTimeCode?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
  status: "ACTIVE" | "INACTIVE" ;
}
  
  export default IUser
