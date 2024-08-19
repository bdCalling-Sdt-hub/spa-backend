

interface IService {
    name: string;
    description: string;
    image?: {
        publicFileURL: string;
        path: string;
    };
}


export default IService;