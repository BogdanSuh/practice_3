Vue.component('task-card', {
    template: `
        <div class="card" :class="cardClass">
            <h4>{{ card.title }}</h4>
            <p>{{ card.description }}</p>
            <div class="card-dates">
                <small>Создано: {{ formatDate(card.createdAt) }}</small>
                <small>Изменено: {{ formatDate(card.updatedAt) }}</small>
                <small>Дедлайн: {{ formatDate(card.deadline) }}</small>
            </div>
            <div v-if="card.returnReason" class="return-reason">{{ card.returnReason }}</div>
            <div v-if="isCompleted" class="status-badge" :class="statusClass">
                {{ isOverdue ? 'Просрочено' : 'В срок' }}
            </div>
            <div class="card-actions">
                <button v-if="columnIndex === 0" @click="$emit('delete', card.id)" class="btn-delete">Удалить</button>
                <button v-if="columnIndex < 3" @click="$emit('move', card.id, 1)" class="btn-move">Далее</button>
                <button v-if="columnIndex === 2" @click="$emit('return', card)" class="btn-return">Вернуть</button>
                <button @click="$emit('edit', card)" class="btn-edit">Изменить</button>
            </div>
        </div>
    `,
    props: ['card', 'columnIndex'],
    computed: {
        isCompleted() {
            return this.columnIndex === 3;
        },
        isOverdue() {
            if (!this.isCompleted || !this.card.deadline) return false;
            return new Date() > new Date(this.card.deadline);
        },
        cardClass() {
            if (!this.isCompleted) return '';
            return this.isOverdue ? 'card-overdue' : 'card-ontime';
        },
        statusClass() {
            return this.isOverdue ? 'status-overdue' : 'status-ontime';
        }
    },
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
            { title: 'Запланированные', cards: [] },
            { title: 'В работе', cards: [] },
            { title: 'Тестирование', cards: [] },
            { title: 'Выполненные', cards: [] }
        ],
        showModal: false,
        isEdit: false,
        isReturn: false,
        editingCard: null,
        newCard: { title: '', description: '', deadline: '', returnReason: '' }
    },
    methods: {
        openModal() {
            this.newCard = { title: '', description: '', deadline: '', returnReason: '' };
            this.isEdit = false;
            this.isReturn = false;
            this.showModal = true;
        },
        openEditModal(card) {
            this.editingCard = { ...card };
            this.newCard = {
                title: card.title,
                description: card.description,
                deadline: card.deadline,
                returnReason: ''
            };
            this.isEdit = true;
            this.isReturn = false;
            this.showModal = true;
        },
        openReturnModal(card) {
            this.editingCard = { ...card };
            this.newCard = {
                title: card.title,
                description: card.description,
                deadline: card.deadline,
                returnReason: ''
            };
            this.isEdit = false;
            this.isReturn = true;
            this.showModal = true;
        },
        createCard() {
            if (this.newCard.title && this.newCard.description && this.newCard.deadline) {
                if (this.isReturn) {
                    const card = this.findCard(this.editingCard.id);
                    if (card && this.newCard.returnReason) {
                        card.returnReason = this.newCard.returnReason;
                        card.updatedAt = new Date().toISOString();
                        this.columns[2].cards = this.columns[2].cards.filter(c => c.id !== card.id);
                        this.columns[1].cards.push(card);
                    }
                } else if (this.isEdit) {
                    const card = this.findCard(this.editingCard.id);
                    if (card) {
                        card.title = this.newCard.title;
                        card.description = this.newCard.description;
                        card.deadline = this.newCard.deadline;
                        card.updatedAt = new Date().toISOString();
                        if (this.newCard.returnReason) card.returnReason = this.newCard.returnReason;
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