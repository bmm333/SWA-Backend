import {
  Controller, Req, Post, NotFoundException, UseGuards, UseInterceptors, UploadedFile,
  Body, BadRequestException, Dependencies, Get, Param, Put, Delete, ParseIntPipe
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Controller('user')
@Dependencies(UserService)
export class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    try {
      console.log('UserController getProfile - req.user:', req.user);
      console.log('UserController getProfile - req.headers.authorization:', req.headers.authorization);
      
      // Check if user exists in request
      if (!req.user) {
        console.error('No user found in request object');
        throw new BadRequestException('Authentication failed - no user found');
      }

      const userId = req.user.id || req.user.sub;
      console.log('UserController getProfile - userId:', userId);
      
      if (!userId) {
        console.error('No user ID found in token payload');
        throw new BadRequestException('Invalid user ID in token');
      }

      const result = await this.userService.findOneById(userId);
      console.log('UserController getProfile - result found:', !!result);
      
      return { 
        statusCode: 200,
        user: result 
      };
    } catch (error) {
      console.error('UserController getProfile error:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile/setup-status')
  async getProfileSetupStatus(@Req() req) {
    try {
      const userId = req.user.id;
      const status = await this.userService.checkProfileSetupStatus(userId);
      return {
        profileSetupCompleted: status.profileSetupCompleted,
        profileSetupCompletedAt: status.profileSetupCompletedAt,
        needsProfileSetup: !status.profileSetupCompleted
      };
    } catch (error) {
      console.error('Profile setup status error:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateOwnProfile(@Req() req, @Body() updateUserDto /**: UpdateUserDto */) {
    try {
      const userId = req.user.id;
      if (!userId) throw new BadRequestException('Invalid authenticated user');
      return await this.userService.updateUserRecord(userId, updateUserDto);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile/setup')
  @UseInterceptors(FileInterceptor('profilePicture'))
  async setupProfile(@Req() req, @Body() body, @UploadedFile() profilePictureFile) {
    try {
      const userId = req.user.id;
      const profileData = { ...body };
      ['stylePreferences','colorPreferences','favoriteShops','sizes','lifestyles','occasions','avoidMaterials']
        .forEach(key => {
          if (profileData[key] && typeof profileData[key] === 'string') {
            try { profileData[key] = JSON.parse(profileData[key]); } catch (_) {}
          }
        });
      const result = await this.userService.setupUserProfile(userId, profileData, profilePictureFile);
      return {
        statusCode: 200,
        message: 'Profile setup completed successfully',
        user: result
      };
    } catch (error) {
      console.error('Profile setup controller error:', error);
      throw new BadRequestException(`Error setting up user profile: ${error.message}`);
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id) {
    try {
      return await this.userService.findOneById(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Invalid user ID');
    }
  }

  @Post()
  async create(@Body() createUserDto /**: CreateUserDto */) {
    try {
      return await this.userService.createUser(createUserDto);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id, @Body() updateUserDto /**: UpdateUserDto */) {
    try {
      return await this.userService.updateUserRecord(id, updateUserDto);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id) {
    try {
      return await this.userService.remove(id);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}