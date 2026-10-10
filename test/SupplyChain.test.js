const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SupplyChain Smart Contract", function () {
  let supplyChain;
  let admin, manufacturer, supplier, distributor, retailer, consumer, unauthorized;

  beforeEach(async function () {
    [admin, manufacturer, supplier, distributor, retailer, consumer, unauthorized] = await ethers.getSigners();

    const SupplyChain = await ethers.getContractFactory("SupplyChain");
    supplyChain = await SupplyChain.deploy();
    await supplyChain.waitForDeployment();

    // Setup roles
    await supplyChain.assignRole(manufacturer.address, "MANUFACTURER");
    await supplyChain.assignRole(supplier.address, "SUPPLIER");
    await supplyChain.assignRole(distributor.address, "DISTRIBUTOR");
    await supplyChain.assignRole(retailer.address, "RETAILER");
    await supplyChain.assignRole(consumer.address, "CONSUMER");
  });

  it("Should correctly assign and fetch user roles", async function () {
    expect(await supplyChain.getRole(admin.address)).to.equal("ADMIN");
    expect(await supplyChain.getRole(manufacturer.address)).to.equal("MANUFACTURER");
    expect(await supplyChain.getRole(supplier.address)).to.equal("SUPPLIER");
    expect(await supplyChain.getRole(distributor.address)).to.equal("DISTRIBUTOR");
    expect(await supplyChain.getRole(retailer.address)).to.equal("RETAILER");
    expect(await supplyChain.getRole(consumer.address)).to.equal("CONSUMER");
  });

  it("Should allow a manufacturer to create a product", async function () {
    const tx = await supplyChain.connect(manufacturer).createProduct(
      "SKU-100",
      "Laptop Computer",
      "High-end workstation",
      ethers.parseEther("1.5"),
      "Factory A, Shanghai"
    );
    await tx.wait();

    expect(await supplyChain.productCount()).to.equal(1);
    const prod = await supplyChain.getProduct(1);

    expect(prod.id).to.equal(1);
    expect(prod.sku).to.equal("SKU-100");
    expect(prod.name).to.equal("Laptop Computer");
    expect(prod.state).to.equal(1); // State.Manufactured = 1
    expect(prod.owner).to.equal(manufacturer.address);
  });

  it("Should reject non-manufacturers from creating products", async function () {
    await expect(
      supplyChain.connect(unauthorized).createProduct(
        "SKU-FAKE",
        "Fake Product",
        "Invalid",
        ethers.parseEther("0.1"),
        "Unknown"
      )
    ).to.be.revertedWith("Only Manufacturer can create products");
  });

  it("Should track complete supply chain lifecycle through state transitions", async function () {
    // 1. Manufacture
    await supplyChain.connect(manufacturer).createProduct(
      "SKU-ORGANIC-APPLE",
      "Fresh Farm Apples",
      "Box of 500 organic red apples",
      ethers.parseEther("0.1"),
      "Farm 12, California"
    );

    // 2. Ship to Supplier
    await supplyChain.connect(manufacturer).shipToSupplier(
      1,
      supplier.address,
      "Logistics Hub, Oakland",
      "Dispatched via cold storage truck"
    );

    let prod = await supplyChain.getProduct(1);
    expect(prod.state).to.equal(2); // State.InTransitToSupplier = 2
    expect(prod.supplier).to.equal(supplier.address);

    // 3. Receive by Supplier
    await supplyChain.connect(supplier).receiveBySupplier(
      1,
      "Warehouse Alpha, San Jose",
      "Received and verified quality"
    );
    prod = await supplyChain.getProduct(1);
    expect(prod.state).to.equal(3); // State.WithSupplier = 3
    expect(prod.owner).to.equal(supplier.address);

    // 4. Ship to Distributor
    await supplyChain.connect(supplier).shipToDistributor(
      1,
      distributor.address,
      "Highway Freight Hub",
      "In transit via air freight"
    );
    prod = await supplyChain.getProduct(1);
    expect(prod.state).to.equal(4); // State.InTransitToDistributor = 4

    // 5. Receive by Distributor
    await supplyChain.connect(distributor).receiveByDistributor(
      1,
      "Distribution Center, Chicago",
      "Stocked into regional inventory"
    );
    prod = await supplyChain.getProduct(1);
    expect(prod.state).to.equal(5); // State.WithDistributor = 5
    expect(prod.owner).to.equal(distributor.address);

    // 6. Ship to Retailer
    await supplyChain.connect(distributor).shipToRetailer(
      1,
      retailer.address,
      "Local Delivery Route",
      "Delivered to storefront"
    );
    prod = await supplyChain.getProduct(1);
    expect(prod.state).to.equal(6); // State.InTransitToRetailer = 6

    // 7. Receive by Retailer
    await supplyChain.connect(retailer).receiveByRetailer(
      1,
      "Retail Superstore, NYC",
      "Placed on store shelves"
    );
    prod = await supplyChain.getProduct(1);
    expect(prod.state).to.equal(7); // State.WithRetailer = 7
    expect(prod.owner).to.equal(retailer.address);

    // 8. Sell to Consumer
    await supplyChain.connect(retailer).sellToConsumer(
      1,
      consumer.address,
      "Point of Sale, NYC",
      "Sold and receipt issued"
    );
    prod = await supplyChain.getProduct(1);
    expect(prod.state).to.equal(8); // State.SoldToConsumer = 8
    expect(prod.owner).to.equal(consumer.address);

    // Check full history audit trail length
    const history = await supplyChain.getProductHistory(1);
    expect(history.length).to.equal(8);
  });
});
