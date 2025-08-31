// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import { DataTypes } from "../libraries/types/DataTypes.sol";
import { IERC721Enumerable } from "@openzeppelin/contracts/interfaces/IERC721Enumerable.sol";

interface ISnowman is IERC721Enumerable {
    /**
     *
     * @notice Emitted when an accessory has been added
     * @dev Accessory can only be added by contract owner
     * @param accessory Address of accessory
     */
    event AccessoryAdded(address accessory);

    /**
     *
     * @notice Emitted when multiple accessories have been added
     * @dev Accessories can only be added by contract owner
     * @param accessories Address of accessories
     */
    event AccessoriesAdded(address[] accessories);

    /**
     *
     * @notice Emitted when an accessory is removed from a Snowman
     * @dev Accessory can only be removed by the Snowman owner
     * @param accessory Address of accessory removed
     * @param snowmanId Id of Snowman with accessory
     */
    event AccessoryRemoved(address accessory, uint256 snowmanId);

    /**
     *
     * @notice Emitted when an accessory is removed from a Snowman
     * @dev Accessories can only be removed by the Snowman owner
     * @param accessories Accessories removed
     * @param snowmanId Id of Snowman with accessories
     */
    event AccessoriesRemoved(DataTypes.Accessory[] accessories, uint256 snowmanId);

    /**
     *
     * @notice Mints one snowman with dynamic attributes
     */
    function mint() external returns (uint256);

    /**
     *
     * @notice Adds an accessory to Snowman for composition by Snowman owners
     * @dev Can only be added by contract owner
     * @param accessory Address of accessory
     * @param position Determines which position(Foreground or Background) to place the accessory
     */
    function addAccessory(address accessory, DataTypes.AccessoryPosition position) external;

    /**
     *
     * @notice Removes an accessory from a Snowman
     * @dev Can only be removed by the Snowman owner
     * @param accessory Address of accessory
     * @param snowmanId Id of Snowman to remove accessory from
     */
    function removeAccessory(address accessory, uint256 snowmanId) external;

    /**
     *
     * @notice Removes all accessories from a Snowman
     * @dev Can only be removed by the Snowman owner
     * @param snowmanId Id of snowman to remove all accessories from
     */
    function removeAllAccessories(uint256 snowmanId) external;

    /**
     *
     * @notice Returns `true` if an accessory has been added to a Snowman and `false` otherwise
     * @param accessory Address of accessory
     * @param snowmanId Id of Snowman to check
     */
    function hasAccessory(address accessory, uint256 snowmanId) external view returns (bool);

    /**
     *
     * @notice Returns the id of accessory added to a snowman
     * @param accessory Address of accessory
     * @param snowmanId Id of Snowman
     */
    function accessoryId(address accessory, uint256 snowmanId) external view returns (uint256);

    /**
     *
     * @notice Returns the token URI of Snowman
     * @param tokenId Id of Snowman
     */
    function tokenURI(uint256 tokenId) external view returns (string memory);

    /**
     *
     * @notice Returns the SVG image of Snowman
     * @param tokenId Id of Snowman
     */
    function renderTokenById(uint256 tokenId) external view returns (string memory);

    /**
     *
     * @notice Retrieves all accessories
     */
    function getAccessories() external view returns (DataTypes.Accessory[] memory);

    /**
     *
     * @notice Returns `true` if accessory is available for composition and `false` otherwise
     * @dev The contract owner determines if accessory is available or not
     * @param accessory Address of accessory
     */
    function isAccessoryAvailable(address accessory) external view returns (bool);
}
