const Cookies = require("cookies");

interface ICookieStoreSetOptions{
    /**
     * a number representing the milliseconds from Date.now() for expiry
     */
    maxAge?: number;
    /**
     * a Date object indicating the cookie's expiration
     * date (expires at the end of session by default).
     */
    expires?: Date;
    /**
     * a string indicating the path of the cookie (/ by default).
     */
    path?: string;
    /**
     * a string indicating the domain of the cookie (no default).
     */
    domain?: string;
    /**
     * a boolean indicating whether the cookie is only to be sent
     * over HTTPS (false by default for HTTP, true by default for HTTPS).
     */
    secure?: boolean;
    /**
     * a boolean indicating whether the cookie is only to be sent over HTTP(S),
     * and not made available to client JavaScript (true by default).
     */
    httpOnly?: boolean;
    /**
     * a boolean indicating whether to overwrite previously set
     * cookies of the same name (false by default). If this is true,
     * all cookies set during the same request with the same
     * name (regardless of path or domain) are filtered out of
     * the Set-Cookie header when setting this cookie.
     */
    overwrite?: boolean;
}

export class CookieStore{

    private _originalCookieLibInstance;

    constructor(req, res) {
        this._originalCookieLibInstance = new Cookies(req, res, { keys: ["_SIMS_PASSPORT_KEY_"] });
    }

    get(cookieName:string):string|undefined{
        return this._originalCookieLibInstance.get(cookieName, {signed: true});
    }

    set(name:string, value:string, options?:ICookieStoreSetOptions):this{

        let defaultOptions = Object.assign({
            httpOnly: false,
            secure: false,
            path: "/",
            overwrite: false
        }, options);

        defaultOptions['signed'] = true;
        defaultOptions['sameSite'] = 'strict';

        this._originalCookieLibInstance.set(name,value, defaultOptions);
        return this;
    }

    del(name:string):this{
        this._originalCookieLibInstance.set(name);
        return this;
    }

}