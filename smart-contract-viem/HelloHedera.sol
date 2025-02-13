// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26; 

// This contract stores a string in `message`.
// The constructor sets an initial message.
// `get_message()` reads the message.
// `set_message(string)` updates the message.
contract HelloHedera {
    string private message;

    // Constructor: takes an initial string
    constructor(string memory message_) {
        message = message_;
    }

    // Getter
    function get_message() public view returns (string memory) {
        return message;
    }

    // Setter
    function set_message(string memory message_) public {
        message = message_;
    }
}
