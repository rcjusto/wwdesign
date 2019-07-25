import {API} from 'aws-amplify';
import omitEmpty from "omit-empty";

const API_NAME = 'wwdesignerapi';

class ApiService {

    static getAll() {
        return API.get(API_NAME, '/projects', null)
    }

    static getOne(id) {
        return API.get(API_NAME, '/projects/object/' + id, null)
    }

    static create(data) {
        return API.post(API_NAME, '/projects', {
            body: omitEmpty(data)
        });
    }

    static update(id, data) {
        data.id = id;
        return API.put(API_NAME, '/projects', {
            body: omitEmpty(data)
        });
    }

    static delete(id) {
        return API.del(API_NAME, '/projects/object/' + id, null)
    }

    static getObjectList = (l) => {
        let list = [];
        l.forEach((e) => {
            if (!e.hide) {
                if (e.pos && e.siz) {
                    list.push({
                        id: e.id,
                        name: e.name,
                        position: e.pos,
                        rotation: e.rotation,
                        size: e.siz,
                        type: e.type || "wood"
                    });
                }
                if (e.children) {
                    list = list.concat(ApiService.getObjectList(e.children));
                }
            }
        });
        return list;
    };
}

export default ApiService;