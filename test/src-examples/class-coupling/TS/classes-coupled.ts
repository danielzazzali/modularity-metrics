class Garage {
    private car: { start(): void };
    constructor() {
        this.car = new Car();
        this.car.start();
    }

    static report() {}
}

const Car = class {
    constructor() {
    }

    start() {
        Garage.report()
    }
}
