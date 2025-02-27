const editorDiv = document.createElement('div');
const html = String.raw;

editorDiv.innerHTML = html`
    <div class="editor" :class="{ 'open': item !== false }" spellcheck="false" x-cloak>
        <div class="editor-head">
            <button type="button" class="wdgt-btn-close wdgt-float-end" aria-label="Close" @click="item=false"></button>
        </div>
        <div class="editor-body">
            <template x-if="item">
                <div>
                    <template x-if="!Array.isArray(item)">
                        <div>
                            <template x-for="[key, value] in Object.entries(item)">
                                <div>
                                    <div class="label" x-text="key"></div>
                                    <template x-if="key=='body' || key=='description'">
                                        <div>
                                            <textarea class="wdgt-form-control" x-model="item[key]"></textarea>
                                        </div>
                                    </template>

                                    <template x-if="key=='image'">
                                        <div>
                                            <span class="wdgt-btn wdgt-btn-outline-secondary btn-file"> Browse <input type="file" @change="(e) => uploadImage(e)" /> </span>
                                            <template x-if="item.image">
                                                <img :src="item.image" class="wdgt-w-100 wdgt-mt-2" />
                                            </template>
                                        </div>
                                    </template>

                                    <template x-if="key!=='body' && key!=='description' && key!=='image' && key!=='items'">
                                        <div>
                                            <input type="text" class="wdgt-form-control" x-model="item[key]" />
                                        </div>
                                    </template>

                                    <template x-if="key=='items' && item.items">
                                        <div>
                                            <template x-for="obj, index in value" :key="index">
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
                                                            <div class="label" x-text="key"></div>
                                                            <template x-if="key=='body' || key=='description'">
                                                                <div>
                                                                    <textarea class="wdgt-form-control" x-model="item.items[index][key]"></textarea>
                                                                </div>
                                                            </template>
                                                            <template x-if="key=='image'">
                                                                <div>
                                                                    <span class="wdgt-btn wdgt-btn-outline-secondary btn-file"> Browse <input type="file" @change="(e) => uploadImage(e, index)" /> </span>
                                                                    <template x-if="item.items[index].image">
                                                                        <img :src="item.items[index].image" class="wdgt-w-100 wdgt-mt-2" />
                                                                    </template>
                                                                </div>
                                                            </template>
                                                            <template x-if="key!=='body' && key!=='description' && key!=='image'">
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
`;
document.getElementById('app').appendChild(editorDiv);

function app() {
    return {
        data: {},
        item: false,
        loaded: false,
        async init() {
            console.log('init');

            try {
                const response = await fetch('data.json'); // Adjust the path if necessary
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                const data = await response.json();
                console.log(data); // Log the data to the console

                this.data = data;
                this.loaded = true;
            } catch (error) {
                console.error('There was a problem with the fetch operation:', error);
            }

            setTimeout(() => {
                document.querySelectorAll('[x-editable]').forEach((el) => {
                    el.addEventListener('click', (ev) => {
                        let myel = ev.target.closest('[x-editable]');
                        let section = myel.getAttribute('x-editable');
                        console.log(section);
                        this.item = this.data[section];
                        // console.log(this.item);

                        document.querySelectorAll('.editing').forEach((el) => {
                            el.classList.remove('editing');
                        });
                        myel.classList.add('editing');
                    });
                });
            }, 500);
        },
        save() {
            console.log(this.data);
            this.item = false;
        },
        // Array operations
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
            if (this.item.items.length == 1) {
                alert('You can not delete the last item');
            } else {
                if (confirm('Are you sure you wish to delete this item?')) {
                    this.item.items.splice(index, 1);
                }
            }
        },

        moveArrayItem(index, direction) {
            if (direction === 'up' && index > 0) {
                // Swap with previous item
                [this.item.items[index], this.item.items[index - 1]] = [this.item.items[index - 1], this.item.items[index]];
            } else if (direction === 'down' && index < this.item.items.length - 1) {
                // Swap with next item
                [this.item.items[index], this.item.items[index + 1]] = [this.item.items[index + 1], this.item.items[index]];
            }
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

                // Convert the resized image to a base64 string
                resizedCanvas.toBlob(
                    (blob) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const base64data = reader.result;

                            console.log(base64data);

                            if (index === null) {
                                this.item.image = base64data; // Set the base64 string as the value of item[key]
                            } else {
                                this.item.items[index].image = base64data; // Set the base64 string for item[key][index].image
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
