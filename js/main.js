Vue.component('task-card', {
    template: `
        <div class="card">
            <h4>{{ card.title }}</h4>
            <p>{{ card.description }}</p>
            <small> {{ formatDate(card.deadline) }}</small>
        </div>
    `,
    props: ['card'],
    methods: {
        formatDate(date) {
            if (!date) return '';
            return new Date(date).toLocaleDateString('ru-RU');
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
        newCard: { title: '', description: '', deadline: '' }
    },
    methods: {
        openModal() {
            this.newCard = { title: '', description: '', deadline: '' };
            this.showModal = true;
        },
        createCard() {
            if (this.newCard.title && this.newCard.description && this.newCard.deadline) {
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
                this.showModal = false;
                this.saveData();
            }
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