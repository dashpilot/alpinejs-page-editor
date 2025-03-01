const editorDiv = document.createElement('div');
const html = String.raw;

editorDiv.innerHTML = html`
    <div class="editor" :class="{ 'open': item !== false }" spellcheck="false" x-cloak>
        <div class="editor-head wdgt-tabs">
            <span class="wdgt-tab wdgt-tab-active"> Edit </span>
            <button type="button" class="wdgt-btn-close wdgt-float-end" aria-label="Close" @click="closeEditor"></button>
        </div>
        <div class="editor-body">
            <template x-if="item">
                <div>
                    <template x-if="!Array.isArray(item)">
                        <div>
                            <template x-for="[key, value] in Object.entries(item)">
                                <div>
                                    <!-- Show label for all non-hidden fields -->
                                    <template x-if="!isFieldType(key, 'hidden')">
                                        <div class="label" x-text="key.replaceAll('_', ' ')"></div>
                                    </template>

                                    <!-- Text area fields -->
                                    <template x-if="isFieldType(key, 'textarea')">
                                        <div>
                                            <textarea class="wdgt-form-control" x-model="item[key]"></textarea>
                                        </div>
                                    </template>

                                    <!-- HTML fields -->
                                    <template x-if="isFieldType(key, 'html')">
                                        <div>
                                            <div class="wdgt-btn-group wdgt-pb">
                                                <button @click="execCommand('bold')" class="wdgt-btn wdgt-btn-outline-secondary wdgt-rte-btn" title="Bold">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-type-bold" viewBox="0 0 16 16">
                                                        <path d="M8.21 13c2.106 0 3.412-1.087 3.412-2.823 0-1.306-.984-2.283-2.324-2.386v-.055a2.176 2.176 0 0 0 1.852-2.14c0-1.51-1.162-2.46-3.014-2.46H3.843V13zM5.908 4.674h1.696c.963 0 1.517.451 1.517 1.244 0 .834-.629 1.32-1.73 1.32H5.908V4.673zm0 6.788V8.598h1.73c1.217 0 1.88.492 1.88 1.415 0 .943-.643 1.449-1.832 1.449H5.907z" />
                                                    </svg>
                                                </button>
                                                <button @click="execCommand('italic')" class="wdgt-btn wdgt-btn-outline-secondary wdgt-rte-btn" title="Italic">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-type-italic" viewBox="0 0 16 16">
                                                        <path d="M7.991 11.674 9.53 4.455c.123-.595.246-.71 1.347-.807l.11-.52H7.211l-.11.52c1.06.096 1.128.212 1.005.807L6.57 11.674c-.123.595-.246.71-1.346.806l-.11.52h3.774l.11-.52c-1.06-.095-1.129-.211-1.006-.806z" />
                                                    </svg>
                                                </button>
                                                <button @click="addLink()" class="wdgt-btn wdgt-btn-outline-secondary wdgt-rte-btn" title="Add Link">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-link-45deg" viewBox="0 0 16 16">
                                                        <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z" />
                                                        <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <div id="rte-body" x-ref="richTextEditor" contenteditable="true" @input="handleRichTextChange" class="wdgt-form-control wdgt-overflow"></div>
                                        </div>
                                    </template>

                                    <!-- Image fields -->
                                    <template x-if="isFieldType(key, 'image')">
                                        <div>
                                            <span class="wdgt-btn wdgt-btn-outline-secondary btn-file"> Browse <input type="file" @change="(e) => uploadImage(e)" /> </span>
                                            <template x-if="item.image">
                                                <img :src="item.image" class="wdgt-w-100 wdgt-mt-2 wdgt-img" />
                                            </template>
                                        </div>
                                    </template>

                                    <!-- Text input fields (everything else that's not special) -->
                                    <template x-if="!isFieldType(key, 'textarea') && !isFieldType(key, 'html') && !isFieldType(key, 'image') && !isFieldType(key, 'array') && !isFieldType(key, 'hidden')">
                                        <div>
                                            <input type="text" class="wdgt-form-control" x-model="item[key]" />
                                        </div>
                                    </template>

                                    <!-- Array items -->
                                    <template x-if="isFieldType(key, 'array') && item.items">
                                        <div>
                                            <template x-for="(obj, index) in item.items" :key="index">
                                                <div class="wdgt-group">
                                                    <div class="wdgt-group-header">
                                                        <span class="wdgt-group-title" x-text="'Item ' + (index + 1)"></span>
                                                        <div class="wdgt-group-controls">
                                                            <button type="button" class="wdgt-small-btn wdgt-btn-circle" @click="moveArrayItem(index, 'up')" :disabled="index === 0">↑</button>
                                                            <button type="button" class="wdgt-small-btn wdgt-btn-circle" @click="moveArrayItem(index, 'down')" :disabled="index === item.items.length - 1">↓</button>
                                                            <button type="button" class="wdgt-small-btn wdgt-btn-circle btn-danger" @click="removeArrayItem(index)">-</button>
                                                        </div>
                                                    </div>
                                                    <template x-for="[key, value] in Object.entries(obj)">
                                                        <div>
                                                            <div class="label" x-text="key.replaceAll('_', ' ')"></div>

                                                            <!-- Text area fields -->
                                                            <template x-if="isFieldType(key, 'textarea')">
                                                                <div>
                                                                    <textarea class="wdgt-form-control" x-model="item.items[index][key]"></textarea>
                                                                </div>
                                                            </template>

                                                            <!-- Image fields -->
                                                            <template x-if="isFieldType(key, 'image')">
                                                                <div>
                                                                    <span class="wdgt-btn wdgt-btn-outline-secondary btn-file"> Browse <input type="file" @change="(e) => uploadImage(e, index)" /> </span>
                                                                    <template x-if="item.items[index].image">
                                                                        <img :src="item.items[index].image" class="wdgt-w-100 wdgt-mt-2 wdgt-img" />
                                                                    </template>
                                                                </div>
                                                            </template>

                                                            <!-- Text input fields (everything else) -->
                                                            <template x-if="!isFieldType(key, 'textarea') && !isFieldType(key, 'html') && !isFieldType(key, 'image') && !isFieldType(key, 'hidden')">
                                                                <div>
                                                                    <input type="text" class="wdgt-form-control" x-model="item.items[index][key]" />
                                                                </div>
                                                            </template>
                                                        </div>
                                                    </template>
                                                </div>
                                            </template>
                                            <div class="wdgt-text-center">
                                                <button class="wdgt-btn wdgt-btn-outline-secondary" @click="addArrayItem">+</button>
                                            </div>
                                        </div>
                                    </template>
                                </div>
                            </template>
                        </div>
                    </template>
                </div>
            </template>
        </div>
    </div>

    <template x-if="item">
        <div class="editor-footer">
            <button class="wdgt-btn wdgt-btn-dark wdgt-w-100" @click="save">Save</button>
        </div>
    </template>

    <div class="settings" :class="{ 'open': showSettings !== false }" spellcheck="false" x-cloak>
        <div class="editor-head wdgt-tabs">
            <span class="wdgt-tab wdgt-tab-active">Settings</span>
            <button type="button" class="wdgt-btn-close wdgt-float-end" aria-label="Close" @click="showSettings = false"></button>
        </div>

        <div class="editor-body">
            <div class="label">Sections</div>
            <template x-for="[section, val] in Object.entries(data)">
                <div>
                    <div class="wdgt-box">
                        <span class="wdgt-section-name" x-text="section"></span>
                        <div class="wdgt-switch">
                            <input type="checkbox" :id="'toggle-'+section" class="wdgt-switch-input" x-model="val.active" />
                            <label :for="'toggle-'+section" class="wdgt-switch-label"></label>
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </div>

    <div class="wdgt-dock">
        <template x-if="enableSettings"><img src="https://alpinejs-page-editor.vercel.app/img/settings.png" class="wdgt-grow" @click="openSettings" /></template>
    </div>
`;
document.getElementById('app').appendChild(editorDiv);

function app() {
    return {
        data: {},
        item: false,
        loaded: false,
        showSettings: false,
        enableSettings: window.cfg?.enableSettings ?? true,
        fieldTypes: {
            hidden: ['active', 'id'],
            textarea: ['intro', 'description', 'details'],
            html: ['body'],
            image: ['image'],
            array: ['items'],
        },
        isFieldType(key, type) {
            return this.fieldTypes[type].includes(key);
        },
        async init() {
            console.log('init');

            try {
                const response = await fetch('data.json');
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                const data = await response.json();
                console.log(data);

                this.data = data;
                this.loaded = true;
            } catch (error) {
                console.error('There was a problem with the fetch operation:', error);
            }

            document.body.addEventListener('click', (ev) => {
                if (ev.target.tagName.toLowerCase() === 'a') {
                    return;
                }

                let myel = ev.target.closest('[x-editable]');
                if (myel) {
                    let section = myel.getAttribute('x-editable');
                    console.log(section);
                    this.showSettings = false;
                    this.item = this.data[section];

                    document.querySelectorAll('.editing').forEach((el) => {
                        el.classList.remove('editing');
                    });
                    myel.classList.add('editing');
                    myel.scrollIntoView({ behavior: 'smooth', block: 'center' });

                    setTimeout(() => {
                        if (document.querySelector('#rte-body')) {
                            document.querySelector('#rte-body').innerHTML = this.item.body;
                        }
                    }, 10);
                }
            });
        },
        async save() {
            let postData = {
                page: window.cfg?.page ?? 'home',
                template: window.cfg?.template ?? 'default',
                content: this.data,
            };
            try {
                console.log(postData);

                const response = await fetch('/api/save', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(postData), // Convert this.data to a JSON string
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }

                const result = await response.json();
                console.log('Data saved successfully:', result);
            } catch (error) {
                console.error('Endpoint /api/save does not exist. No worries.' + error);
            }

            console.log(this.data);
            this.item = false;
        },

        closeEditor() {
            this.item = false;
            document.querySelectorAll('.editing').forEach((el) => {
                el.classList.remove('editing');
            });
        },

        openSettings() {
            this.showSettings = true;
            this.item = false;
            document.querySelectorAll('.editing').forEach((el) => {
                el.classList.remove('editing');
            });
        },

        addArrayItem() {
            // Clone the structure of the first item
            const newItem = {};
            if (this.item.items.length > 0) {
                Object.keys(this.item.items[0]).forEach((key) => {
                    newItem[key] = '';
                });
            }

            // Add to array
            this.item.items.push(newItem);
        },

        removeArrayItem(index) {
            if (!Array.isArray(this.item.items) || this.item.items.length === 0) {
                alert('No items to delete');
                return;
            }

            if (this.item.items.length === 1) {
                alert('You cannot delete the last item.');
            } else {
                if (confirm('Are you sure you wish to delete this item?')) {
                    // Create a copy of the array
                    const itemsCopy = [...this.item.items];

                    // Check if the index is valid
                    if (index >= 0 && index < itemsCopy.length) {
                        // Remove the item from the copy
                        itemsCopy.splice(index, 1);

                        // Replace the original array with the modified copy
                        this.item.items = itemsCopy;
                    } else {
                        console.error('Invalid index:', index);
                    }
                }
            }
        },

        moveArrayItem(index, direction) {
            if (direction === 'up' && index > 0) {
                [this.item.items[index], this.item.items[index - 1]] = [this.item.items[index - 1], this.item.items[index]];
            } else if (direction === 'down' && index < this.item.items.length - 1) {
                [this.item.items[index], this.item.items[index + 1]] = [this.item.items[index + 1], this.item.items[index]];
            }
        },

        execCommand(command, value) {
            document.execCommand(command, false, value);
            const editor = this.$refs.richTextEditor;
            if (this.item) {
                this.item.body = editor.innerHTML;
            }
        },

        addLink() {
            const url = prompt('Enter URL:');
            if (url) {
                this.execCommand('createLink', url);
            }
        },

        handleRichTextChange() {
            const editor = this.$refs.richTextEditor;
            this.item.body = editor.innerHTML;
        },

        uploadImage(event, index = null) {
            const file = event.target.files[0];
            if (!file) return;

            const img = new Image();
            const reader = new FileReader();

            reader.onload = (e) => {
                img.src = e.target.result;
            };

            reader.readAsDataURL(file);

            img.onload = async () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const mypica = window.pica();

                const aspectRatio = img.width / img.height;
                canvas.width = 750;
                canvas.height = 750 / aspectRatio;

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const resizedCanvas = document.createElement('canvas');
                resizedCanvas.width = 750;
                resizedCanvas.height = 750 / aspectRatio;

                await mypica.resize(canvas, resizedCanvas);

                resizedCanvas.toBlob(
                    (blob) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const base64data = reader.result;

                            console.log(base64data);

                            if (index === null) {
                                this.item.image = base64data;
                            } else {
                                this.item.items[index].image = base64data;
                            }
                        };
                        reader.readAsDataURL(blob);
                    },
                    'image/jpeg',
                    0.9,
                );
            };
        },
    };
}
