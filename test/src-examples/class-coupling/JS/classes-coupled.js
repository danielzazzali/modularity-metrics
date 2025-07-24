class Garage {
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
