// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SupplyChain
 * @dev Full-stack Blockchain Supply Chain Management Contract with Role-Based Access Control
 * and Complete Audit Trail History.
 */
contract SupplyChain {
    address public admin;

    enum State {
        Created,                // 0
        Manufactured,           // 1
        InTransitToSupplier,    // 2
        WithSupplier,           // 3
        InTransitToDistributor, // 4
        WithDistributor,        // 5
        InTransitToRetailer,    // 6
        WithRetailer,           // 7
        SoldToConsumer          // 8
    }

    struct StateHistory {
        State state;
        address updatedBy;
        uint256 timestamp;
        string location;
        string notes;
    }

    struct Product {
        uint256 id;
        string sku;
        string name;
        string description;
        uint256 price;
        State state;
        address owner;
        address manufacturer;
        address supplier;
        address distributor;
        address retailer;
        address consumer;
        uint256 createdAt;
    }

    // Storage
    uint256 public productCount;
    mapping(uint256 => Product) public products;
    mapping(uint256 => StateHistory[]) private productHistory;
    mapping(address => string) public userRoles;
    address[] public registeredUsers;

    // Events
    event RoleAssigned(address indexed account, string role);
    event ProductCreated(uint256 indexed id, string sku, string name, address indexed manufacturer);
    event ProductStateUpdated(
        uint256 indexed id,
        State state,
        address indexed updatedBy,
        string location,
        string notes,
        uint256 timestamp
    );
    event OwnershipTransferred(uint256 indexed id, address indexed from, address indexed to);

    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin || keccak256(bytes(userRoles[msg.sender])) == keccak256(bytes("ADMIN")), "Only Admin can call this");
        _;
    }

    modifier onlyRole(string memory role) {
        require(
            keccak256(bytes(userRoles[msg.sender])) == keccak256(bytes(role)) || msg.sender == admin,
            string(abi.encodePacked("Access denied: Requires role ", role))
        );
        _;
    }

    modifier productExists(uint256 _id) {
        require(_id > 0 && _id <= productCount, "Product does not exist");
        _;
    }

    modifier onlyProductOwner(uint256 _id) {
        require(products[_id].owner == msg.sender || msg.sender == admin, "Only product owner can perform this operation");
        _;
    }

    constructor() {
        admin = msg.sender;
        userRoles[msg.sender] = "ADMIN";
        registeredUsers.push(msg.sender);
        emit RoleAssigned(msg.sender, "ADMIN");
    }

    // Role Management
    function assignRole(address _account, string memory _role) public onlyAdmin {
        require(_account != address(0), "Invalid address");
        require(bytes(_role).length > 0, "Role cannot be empty");
        
        if (bytes(userRoles[_account]).length == 0) {
            registeredUsers.push(_account);
        }
        userRoles[_account] = _role;
        emit RoleAssigned(_account, _role);
    }

    function getRole(address _account) public view returns (string memory) {
        return userRoles[_account];
    }

    function getAllUsers() public view returns (address[] memory accounts, string[] memory roles) {
        uint256 count = registeredUsers.length;
        accounts = new address[](count);
        roles = new string[](count);
        for (uint256 i = 0; i < count; i++) {
            accounts[i] = registeredUsers[i];
            roles[i] = userRoles[registeredUsers[i]];
        }
        return (accounts, roles);
    }

    // Supply Chain Operations
    function createProduct(
        string memory _sku,
        string memory _name,
        string memory _description,
        uint256 _price,
        string memory _location
    ) public returns (uint256) {
        // Anyone with MANUFACTURER role (or Admin) can manufacture
        require(
            keccak256(bytes(userRoles[msg.sender])) == keccak256(bytes("MANUFACTURER")) || msg.sender == admin,
            "Only Manufacturer can create products"
        );

        productCount++;
        uint256 newId = productCount;

        Product storage p = products[newId];
        p.id = newId;
        p.sku = _sku;
        p.name = _name;
        p.description = _description;
        p.price = _price;
        p.state = State.Manufactured;
        p.owner = msg.sender;
        p.manufacturer = msg.sender;
        p.createdAt = block.timestamp;

        _addHistory(newId, State.Manufactured, msg.sender, _location, "Product Manufactured");

        emit ProductCreated(newId, _sku, _name, msg.sender);
        emit ProductStateUpdated(newId, State.Manufactured, msg.sender, _location, "Product Manufactured", block.timestamp);

        return newId;
    }

    function shipToSupplier(
        uint256 _id,
        address _supplier,
        string memory _location,
        string memory _notes
    ) public productExists(_id) onlyProductOwner(_id) {
        require(products[_id].state == State.Manufactured, "Product must be in Manufactured state");
        require(_supplier != address(0), "Invalid supplier address");

        products[_id].supplier = _supplier;
        products[_id].state = State.InTransitToSupplier;

        _addHistory(_id, State.InTransitToSupplier, msg.sender, _location, _notes);
        emit ProductStateUpdated(_id, State.InTransitToSupplier, msg.sender, _location, _notes, block.timestamp);
    }

    function receiveBySupplier(
        uint256 _id,
        string memory _location,
        string memory _notes
    ) public productExists(_id) {
        Product storage p = products[_id];
        require(p.state == State.InTransitToSupplier, "Product is not in transit to supplier");
        require(msg.sender == p.supplier || msg.sender == admin, "Only assigned supplier can receive");

        address previousOwner = p.owner;
        p.owner = msg.sender;
        p.state = State.WithSupplier;

        _addHistory(_id, State.WithSupplier, msg.sender, _location, _notes);
        emit OwnershipTransferred(_id, previousOwner, msg.sender);
        emit ProductStateUpdated(_id, State.WithSupplier, msg.sender, _location, _notes, block.timestamp);
    }

    function shipToDistributor(
        uint256 _id,
        address _distributor,
        string memory _location,
        string memory _notes
    ) public productExists(_id) onlyProductOwner(_id) {
        require(products[_id].state == State.WithSupplier, "Product must be with supplier");
        require(_distributor != address(0), "Invalid distributor address");

        products[_id].distributor = _distributor;
        products[_id].state = State.InTransitToDistributor;

        _addHistory(_id, State.InTransitToDistributor, msg.sender, _location, _notes);
        emit ProductStateUpdated(_id, State.InTransitToDistributor, msg.sender, _location, _notes, block.timestamp);
    }

    function receiveByDistributor(
        uint256 _id,
        string memory _location,
        string memory _notes
    ) public productExists(_id) {
        Product storage p = products[_id];
        require(p.state == State.InTransitToDistributor, "Product is not in transit to distributor");
        require(msg.sender == p.distributor || msg.sender == admin, "Only assigned distributor can receive");

        address previousOwner = p.owner;
        p.owner = msg.sender;
        p.state = State.WithDistributor;

        _addHistory(_id, State.WithDistributor, msg.sender, _location, _notes);
        emit OwnershipTransferred(_id, previousOwner, msg.sender);
        emit ProductStateUpdated(_id, State.WithDistributor, msg.sender, _location, _notes, block.timestamp);
    }

    function shipToRetailer(
        uint256 _id,
        address _retailer,
        string memory _location,
        string memory _notes
    ) public productExists(_id) onlyProductOwner(_id) {
        require(products[_id].state == State.WithDistributor, "Product must be with distributor");
        require(_retailer != address(0), "Invalid retailer address");

        products[_id].retailer = _retailer;
        products[_id].state = State.InTransitToRetailer;

        _addHistory(_id, State.InTransitToRetailer, msg.sender, _location, _notes);
        emit ProductStateUpdated(_id, State.InTransitToRetailer, msg.sender, _location, _notes, block.timestamp);
    }

    function receiveByRetailer(
        uint256 _id,
        string memory _location,
        string memory _notes
    ) public productExists(_id) {
        Product storage p = products[_id];
        require(p.state == State.InTransitToRetailer, "Product is not in transit to retailer");
        require(msg.sender == p.retailer || msg.sender == admin, "Only assigned retailer can receive");

        address previousOwner = p.owner;
        p.owner = msg.sender;
        p.state = State.WithRetailer;

        _addHistory(_id, State.WithRetailer, msg.sender, _location, _notes);
        emit OwnershipTransferred(_id, previousOwner, msg.sender);
        emit ProductStateUpdated(_id, State.WithRetailer, msg.sender, _location, _notes, block.timestamp);
    }

    function sellToConsumer(
        uint256 _id,
        address _consumer,
        string memory _location,
        string memory _notes
    ) public productExists(_id) onlyProductOwner(_id) {
        Product storage p = products[_id];
        require(p.state == State.WithRetailer, "Product must be with retailer to be sold");
        require(_consumer != address(0), "Invalid consumer address");

        address previousOwner = p.owner;
        p.consumer = _consumer;
        p.owner = _consumer;
        p.state = State.SoldToConsumer;

        _addHistory(_id, State.SoldToConsumer, msg.sender, _location, _notes);
        emit OwnershipTransferred(_id, previousOwner, _consumer);
        emit ProductStateUpdated(_id, State.SoldToConsumer, msg.sender, _location, _notes, block.timestamp);
    }

    // Helper functions
    function _addHistory(
        uint256 _id,
        State _state,
        address _updatedBy,
        string memory _location,
        string memory _notes
    ) internal {
        productHistory[_id].push(StateHistory({
            state: _state,
            updatedBy: _updatedBy,
            timestamp: block.timestamp,
            location: _location,
            notes: _notes
        }));
    }

    function getProductHistory(uint256 _id) public view productExists(_id) returns (StateHistory[] memory) {
        return productHistory[_id];
    }

    function getProduct(uint256 _id) public view productExists(_id) returns (Product memory) {
        return products[_id];
    }

    function getAllProducts() public view returns (Product[] memory) {
        Product[] memory list = new Product[](productCount);
        for (uint256 i = 1; i <= productCount; i++) {
            list[i - 1] = products[i];
        }
        return list;
    }
}
