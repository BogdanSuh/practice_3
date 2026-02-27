Vue.component('task-card', {
    template: `
        <div class="card">
            <h4>{{ card.title }}</h4>
            <p>{{ card.description }}</p>
            <small> {{ formatDate(card.deadline) }}</small>
            <small v-if="card.updatedAt">Обновить {{ formatDate(card.updatedAt) }}</small>
            <div class="card-actions">
                <button v-if="columnIndex === 0" @click="$emit('delete', card.id)" class="btn-delete">🗑️</button>
                <button v-if="columnIndex < 3" @click="$emit('move', card.id, 1)" class="btn-move">→</button>
                <button @click="$emit('edit', card)" class="btn-edit">Изменить</button>
            </div>
        </div>
    `,
    props: ['card', 'columnIndex'],
    methods: {
        formatDate(date) {
            if (!date) return '';
            return new Date(date).toLocaleString('ru-RU');
        }
    }
});

new Vue({
    el: '#app',
    data: {
        columns: [
            { title: ' Запланированные', cards: [] },
            { title: ' В работе', cards: [] },
            { title: ' Тестирование', cards: [] },
            { title: ' Выполненные', cards: [] }
        ],
        showModal: false,
        isEdit: false,
        editingCard: null,
        newCard: { title: '', description: '', deadline: '' }
    },
    methods: {
        openModal() {
            this.newCard = { title: '', description: '', deadline: '' };
            this.isEdit = false;
            this.showModal = true;
        },
        openEditModal(card) {
            this.editingCard = { ...card };
            this.newCard = {
                title: card.title,
                description: card.description,
                deadline: card.deadline
            };
            this.isEdit = true;
            this.showModal = true;
        },
        createCard() {
            if (this.newCard.title && this.newCard.description && this.newCard.deadline) {
                if (this.isEdit) {
                    const card = this.findCard(this.editingCard.id);
                    if (card) {
                        card.title = this.newCard.title;
                        card.description = this.newCard.description;
                        card.deadline = this.newCard.deadline;
                        card.updatedAt = new Date().toISOString();
                    }
                } else {
                    const card = {
                        id: Date.now(),
                        title: this.newCard.title,
                        description: this.newCard.description,
                        deadline: this.newCard.deadline,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        returnReason: ''
                    };
                    this.columns[0].cards.push(card);
                }
                this.showModal = false;
                this.saveData();
            }
        },
        deleteCard(cardId) {
            if (confirm('Удалить задачу?')) {
                for (let col of this.columns) {
                    const index = col.cards.findIndex(c => c.id === cardId);
                    if (index !== -1) {
                        col.cards.splice(index, 1);
                        break;
                    }
                }
                this.saveData();
            }
        },
        moveCard(cardId, direction) {
            const card = this.findCard(cardId);
            const fromIndex = this.findColumnIndex(cardId);
            const toIndex = fromIndex + direction;

            if (card && fromIndex !== -1 && toIndex >= 0 && toIndex < 4) {
                this.columns[fromIndex].cards = this.columns[fromIndex].cards.filter(c => c.id !== cardId);
                card.updatedAt = new Date().toISOString();
                this.columns[toIndex].cards.push(card);
                this.saveData();
            }
        },
        findCard(id) {
            for (let col of this.columns) {
                const card = col.cards.find(c => c.id === id);
                if (card) return card;
            }
            return null;
        },
        findColumnIndex(cardId) {
            for (let i = 0; i < this.columns.length; i++) {
                if (this.columns[i].cards.some(c => c.id === cardId)) {
                    return i;
                }
            }
            return -1;
        },
        saveData() {
            localStorage.setItem('kanbanData', JSON.stringify(this.columns));
        },
        loadData() {
            const data = localStorage.getItem('kanbanData');
            if (data) this.columns = JSON.parse(data);
        }
    },
    mounted() {
        this.loadData();
    }
});