export default class Utils {

    static stringConstructor = "test".constructor;
    static arrayConstructor = [].constructor;
    static objectConstructor = {}.constructor;

    static TYPE_ARRAY = "Array";
    static TYPE_OBJECT = "Object";
    static TYPE_STRING = "String";
    static TYPE_NULL = "null";
    static TYPE_UNDEFINED = "undefined";
    static TYPE_UNKNOWN = "unknown";

    static getType(object) {
        if (object === null) {
            return this.TYPE_NULL;
        }
        else if (object === undefined) {
            return this.TYPE_UNDEFINED;
        }
        else if (object.constructor === Utils.stringConstructor) {
            return this.TYPE_STRING;
        }
        else if (object.constructor === Utils.arrayConstructor) {
            return this.TYPE_ARRAY;
        }
        else if (object.constructor === Utils.objectConstructor) {
            return this.TYPE_OBJECT;
        }
        else {
            return this.TYPE_UNKNOWN;
        }
    }

    static isArray(object) {
        return this.getType(object) === this.TYPE_ARRAY;
    }

    static isObject(object) {
        return this.getType(object) === this.TYPE_OBJECT;
    }

    static hasClass(element, classname) {
        let arr = element.className ? element.className.split(' ') : [];
        return arr.indexOf(classname)>-1;
    }

    static addClass(element, classname) {
        let arr = element.className ? element.className.split(' ') : [];
        if (arr.indexOf(classname)<0) {
            arr.push(classname);
        }
        element.className = arr.join(' ');
    }

    static delClass(element, classname) {
        let arr = element.className ? element.className.split(' ') : [];
        const index = arr.indexOf(classname);
        if (index>-1) {
            arr.splice(index,1);
            element.className = arr.join(' ');
        }
    }

    static b64toBlob(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        const byteCharacters = atob(b64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        return new Blob(byteArrays, {type: contentType});
    }

}