import { useState } from "react";
import Sections from "./Sections";
import Card from "./Card";


/**
 * Shows the licenses of the app, along with a really short Privacy Notice
 * @returns the license ReactNode
*/
export default function OpenSource() {
    const getMit = (author: string) => `MIT License
    
    Copyright (c) ${author}
    
    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:
    
    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.`
    const license = [{
        license: "mit", author: "Meta Platforms, Inc. and affiliates.", name: "React"
    },
    {
        license: "mit", author: "2019 David Enke", name: "context-filter-polyfill"
    }, {
        license: "mit", author: "2020 Microsoft Corporation", name: "Fluent UI System Icons"
    }, {
        license: "custom", author: "Background Image of Daniil Silantev on Unsplash: https://unsplash.com/it/foto/EVxw4XUZbDo", name: "Background image"
    }, {
        license: "custom", author: "Every request made to Spotify API is done locally on the device, and nothing is sent to an external server. Requests might be done to Google's servers to fetch the default font and to JSDelivr in case of old browsers, but no data is shared with them.", name: "Privacy Policy"
    }];
    let [state, updateState] = useState("React");
    const find = license.find(e => state === e.name);
    return <>
        <h3>Open source licenses:</h3>
        <i>Choose the license from below, and it'll be automatically displayed</i><br></br><br></br>
        <Sections callback={(e) => updateState(e)} list={license.map(e => { return { displayedName: e.name, id: e.name } })}></Sections><br></br>
        <Card type={1}>
            <label style={{ whiteSpace: "pre-line" }}>{find?.license === "mit" ? getMit(find?.author as string) : find?.author}</label>
        </Card>
    </>
}