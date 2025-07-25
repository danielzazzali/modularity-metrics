class Garage {
    constructor() {
        this.car = new Car();
        this.car.start();
    }

    static report() {}
}

class Car {
    constructor() {}

    start() {
        Garage.report()
    }
}
