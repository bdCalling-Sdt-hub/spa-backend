

interface IService {
    name: string;
    description: string;
    image?: {
        publicFileURL: string;
        path: string;
    };
    type: string;
    isDelete: boolean;
}


export default IService;