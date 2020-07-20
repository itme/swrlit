/*
# MIT License

Copyright © 2018–present Ruben Verborgh, Travis Vachon

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF
OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
import { useReducer, useEffect, useDebugValue } from 'react';
import auth from 'solid-auth-client';

type WebId = String | undefined | null
// Keep track of the WebID and the state setters tracking it
let webId: WebId;
const subscribers: Set<any> = new Set();
type GetWebId = (_: any, id: WebId | null) => WebId
const getWebId: GetWebId = (_, id) => id;

/**
 * Returns the WebID (string) of the active user,
 * `null` if there is no user,
 * or `undefined` if the user state is pending.
 */
export default function useWebId(reducer: GetWebId = getWebId) {
    const init = reducer as (_: any) => String
    const [result, updateWebId] = useReducer<GetWebId, WebId>(reducer, webId, init);
    useDebugValue(webId);

    useEffect(() => {
        updateWebId(webId);
        subscribers.add(updateWebId);
        return () => { subscribers.delete(updateWebId) }
    }, []);

    return result;
}

// Inform subscribers when the WebID changes
auth.trackSession(session => {
    webId = session ? session.webId : null;
    for (const subscriber of subscribers)
        subscriber(webId);
});
